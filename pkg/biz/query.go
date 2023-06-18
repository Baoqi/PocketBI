package biz

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/sashabaranov/go-openai"
	"log"
	"net/http"
	"os"
	"pocketbi/pkg/sqlquery"
	"strings"
	"text/template"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

type QueryByShareKey struct {
	App *pocketbase.PocketBase
}

type QueryByShareKeyRequest struct {
	ShareKey string `json:"share_key"`
}

func (q *QueryByShareKey) QueryByShareKeyHandler(c echo.Context) error {
	var shareKeyRequest QueryByShareKeyRequest
	err := c.Bind(&shareKeyRequest)
	if err != nil {
		return err
	}
	record, err := q.QueryCannedReportByShareKey(shareKeyRequest.ShareKey)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, record)
}

func (q *QueryByShareKey) QueryCannedReportByShareKey(shareKey string) (interface{}, error) {
	dao := q.App.Dao()
	recordFound, err := dao.FindRecordById("vis_shared_report", shareKey)
	if err != nil {
		return nil, err
	}

	recordsReport, err := dao.FindRecordById("vis_canned_report", recordFound.Get("report_id").(string))
	if err != nil {
		return nil, err
	}

	return recordsReport, nil
}

type Chat2AnswerQueryColumnsRequest struct {
	TableName string `json:"table_name"`
}

func (q *QueryByShareKey) findChat2AnswerConnectionUrl() (string, error) {
	dao := q.App.Dao()
	recordsFound, err := dao.FindRecordsByExpr("vis_datasource", dbx.HashExp{"name": "chat2answer"})
	if err != nil {
		return "", err
	}

	if recordsFound == nil || len(recordsFound) == 0 {
		return "", errors.New("datasource 'chat2answer' not found")
	}

	recordFound := recordsFound[0]
	return recordFound.Get("connection_url").(string), nil
}

// the following are for chat2answer
func (q *QueryByShareKey) QueryTableSchemaHandler(c echo.Context) error {
	var request Chat2AnswerQueryColumnsRequest
	err := c.Bind(&request)
	if err != nil {
		return err
	}

	connectionUrl, err := q.findChat2AnswerConnectionUrl()
	if err != nil {
		return err
	}

	answer, err := sqlquery.QueryColumnsForChat2Answer(connectionUrl, request.TableName)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, answer)
}

type Chat2AnswerQueryChatGPTRequest struct {
	TableName    string                         `json:"table_name"`
	Columns      []sqlquery.GuandataColumn      `json:"columns"`
	Question     string                         `json:"question"`
	PrevMessages []openai.ChatCompletionMessage `json:"prev_messages"`
}

var systemPromptTemplate = `
the source table's name is {{.TableName}}, with the following columns (separated with |): {{range .Columns}}{{.Name}}|{{end}}

Based on user query, you need to do 2 things: 1. output {{.Syntax}} SQL. 2. based on SQL's result columns, I want to generate vegalite chart, you need to decide which zones each column should be put. 
  - The column names and alias in SQL must be encoded according to {{.Syntax}} SQL syntax
  - When generate SQL, think carefully about what to put on group by, what to put for aggregation, only keep the necessary columns
  - Double check the generated SQL to make sure it can run in {{.Syntax}}
  - each result column should be put into at least one vega zone: (x, y, color, opacity, size,shape, row, column, detail)

For example(The following is for Postgres, when you answer, you need to use {{.Syntax}} Syntax):

Q: 按照大类名称的总销售额目标是多少?

A:
{
  "sql": "select \"大类名称\", sum(\"销售额目标\") as \"总销售额目标\" from daily_product_sales group by 1",
  "columns": [
    {"name": "大类名称", "type": "nominal", "zone": ["x", "color"]},
    {"name": "总销售额目标", "type": "quantitative", "zone": ["y"]}
  ]
}

Only Output Valid JSON, which can be parsed by JSON.parse(), no other contents
`

func getSystemPrompt(tableName string, columns []sqlquery.GuandataColumn) (string, error) {
	t := template.New("systemPromptTemplate")
	parsed, err := t.Parse(systemPromptTemplate)
	if err != nil {
		return "", err
	}
	var query bytes.Buffer
	err = parsed.Execute(&query, map[string]interface{}{
		"TableName": tableName,
		"Columns":   columns,
		"Syntax":    "Apache Spark 3.2",
	})
	if err != nil {
		return "", err
	}
	return query.String(), nil
}

type SqlAndVizSuggestion struct {
	SQL     string `json:"sql"`
	Columns []struct {
		Name string   `json:"name"`
		Type string   `json:"type"`
		Zone []string `json:"zone"`
	} `json:"columns"`
	Result sqlquery.QueryResponse `json:"result"`
}

func validateSqlAndVizSuggestion(suggestion SqlAndVizSuggestion) error {
	if suggestion.SQL == "" {
		return errors.New("generated sql is empty")
	}
	if len(suggestion.Columns) == 0 {
		return errors.New("generated columns is empty")
	}
	for _, column := range suggestion.Columns {
		if column.Name == "" {
			return errors.New("generated column name is empty")
		}
		if len(column.Zone) == 0 {
			return errors.New("generated column zone is empty")
		}
	}
	return nil
}

func (q *QueryByShareKey) QueryChatGPTHandler(c echo.Context) error {
	var request Chat2AnswerQueryChatGPTRequest
	err := c.Bind(&request)
	if err != nil {
		return err
	}

	connectionUrl, err := q.findChat2AnswerConnectionUrl()
	if err != nil {
		return err
	}

	chat2VizResponse, err := callRemoteChat2Viz(err, request)
	if err != nil {
		return err
	}

	var sqlAndVizSuggestion SqlAndVizSuggestion
	err = json.Unmarshal([]byte(chat2VizResponse.Content), &sqlAndVizSuggestion)
	if err != nil {
		if !strings.Contains(chat2VizResponse.Content, "```") {
			return errors.New(fmt.Sprintf("ChatGPT response non-JSON: %s", chat2VizResponse.Content))
		}

		// ChatGPT don't return valid JSON content, retry once
		log.Printf("[warn] Retry once due to ChatGPT don't return valid JSON content: %s\n", chat2VizResponse.Content)

		chat2VizResponse, err = callRemoteChat2Viz(err, request)
		if err != nil {
			return err
		}

		err = json.Unmarshal([]byte(chat2VizResponse.Content), &sqlAndVizSuggestion)
		if err != nil {
			return errors.New(fmt.Sprintf("ChatGPT response non-JSON: %s", chat2VizResponse.Content))
		}
	}

	err = validateSqlAndVizSuggestion(sqlAndVizSuggestion)
	if err != nil {
		return err
	}

	queryResult, err := sqlquery.QuerySQLforChat2Answer(connectionUrl, sqlAndVizSuggestion.SQL)
	if err != nil {
		return err
	}
	sqlAndVizSuggestion.Result = *queryResult

	return c.JSON(http.StatusOK, sqlAndVizSuggestion)
}

func callRemoteChat2Viz(err error, request Chat2AnswerQueryChatGPTRequest) (*openai.ChatCompletionMessage, error) {
	systemPrompt, err := getSystemPrompt(request.TableName, request.Columns)
	if err != nil {
		return nil, err
	}

	messages := make([]openai.ChatCompletionMessage, 0)
	messages = append(messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: systemPrompt,
	})

	// validate previous messages
	var foundAssistantMessage = false
	for _, message := range request.PrevMessages {
		if message.Role == openai.ChatMessageRoleSystem {
			return nil, errors.New("can not set system message")
		} else if message.Role == openai.ChatMessageRoleAssistant && foundAssistantMessage {
			if foundAssistantMessage {
				return nil, errors.New("can not set more than 1 assistant message")
			}
			foundAssistantMessage = true
		}
		messages = append(messages, message)
	}

	messages = append(messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: request.Question,
	})

	openaiRequest := openai.ChatCompletionRequest{
		MaxTokens: 1000,
		Model:     openai.GPT3Dot5Turbo,
		Messages:  messages,
	}

	config := openai.DefaultConfig(os.Getenv("OPENAI_TOKEN"))
	if os.Getenv("OPENAI_BASE_URL") != "" {
		config.BaseURL = os.Getenv("OPENAI_BASE_URL")
	}
	client := openai.NewClientWithConfig(config)
	resp, err := client.CreateChatCompletion(context.Background(), openaiRequest)
	if err != nil {
		return nil, err
	}

	if len(resp.Choices) == 0 {
		return &openai.ChatCompletionMessage{Role: "assistant", Content: "<empty>"}, nil
	}
	return &resp.Choices[0].Message, nil
}
