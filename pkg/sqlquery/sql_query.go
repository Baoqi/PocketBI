package sqlquery

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v5"
	"net/http"
	"strings"
	"sync"
	"text/template"
	"time"

	_ "github.com/lib/pq"
	_ "github.com/mailru/go-clickhouse/v2"
	_ "modernc.org/sqlite"
)

var dbMap sync.Map

type SqlDataSource struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	ConnectionUrl string `json:"connectionUrl"`
}

type FilterParameter struct {
	Type   string `json:"type"`
	Param  string `json:"param"`
	Value  string `json:"value"`
	Remark string `json:"remark"`
}

type QueryRequest struct {
	SqlDataSource SqlDataSource     `json:"sqlDataSource"`
	FilterParams  []FilterParameter `json:"filterParams"`
	SqlQuery      string            `json:"sqlQuery"`
	ResultLimit   int               `json:"resultLimit"`
}

type Column struct {
	Name   string `json:"name"`
	DbType string `json:"dbType" db:"type"`
	Length int64  `json:"length"`
}

type QueryResponse struct {
	Columns []Column                 `json:"columns"`
	Data    []map[string]interface{} `json:"data"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type Table struct {
	Schema  string   `json:"schema"`
	Name    string   `json:"name"`
	Type    string   `json:"type"`
	Columns []Column `json:"columns,omitempty"`
}

func getDriverName(url string) (string, error) {
	if strings.HasPrefix(url, "clickhouse:") ||
		strings.HasPrefix(url, "https:") ||
		strings.HasPrefix(url, "http:") {
		return "chhttp", nil
	} else if strings.HasPrefix(url, "sqlite:") {
		return "sqlite", nil
	} else if strings.HasPrefix(url, "postgres:") {
		return "postgres", nil
	} else {
		return "", fmt.Errorf("unsupported sql url: %s", url)
	}
}

func openConnection(driverName string, url string) (*sqlx.DB, error) {
	// add special handle for sqlite, since it needs to remove beginning "sqlite:"
	if driverName == "sqlite" && strings.HasPrefix(url, "sqlite:") {
		return sqlx.Open(driverName, url[7:])
	} else {
		return sqlx.Open(driverName, url)
	}
}

func getConnection(connectionUrl string) (*sqlx.DB, error) {
	realUrl := connectionUrl
	if strings.HasPrefix(connectionUrl, "jdbc:") {
		realUrl = connectionUrl[5:]
	}

	driverName, err := getDriverName(realUrl)
	if err != nil {
		return nil, err
	}

	existedDb, _ := dbMap.Load(realUrl)
	if existedDb != nil {
		return existedDb.(*sqlx.DB), nil
	}

	db, err := openConnection(driverName, realUrl)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(5)
	db.SetConnMaxIdleTime(2 * time.Minute)
	dbMap.Store(realUrl, db)
	return db, nil
}

func Ping(c echo.Context) error {
	var dataSource SqlDataSource
	err := c.Bind(&dataSource)
	if err != nil {
		return err
	}
	db, err := getConnection(dataSource.ConnectionUrl)
	if err != nil {
		return err
	}
	err = db.Ping()
	if err != nil {
		return err
	}

	return c.String(http.StatusOK, "success")
}

func getColumns(rows *sqlx.Rows) ([]Column, error) {
	columnTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}
	columns := make([]Column, len(columnTypes))
	for i, t := range columnTypes {
		length, ok := t.Length()
		if !ok {
			length = -1
		}
		columns[i] = Column{
			Name:   t.Name(),
			DbType: t.DatabaseTypeName(),
			Length: length,
		}
	}
	return columns, nil
}

func replaceQueryParams(queryTemplate string, queryParams []FilterParameter) (string, error) {
	tmpl, err := template.New("sql").Parse(queryTemplate)
	if err != nil {
		return "", err
	}

	params := make(map[string]interface{}, 0)
	for _, param := range queryParams {
		// If the type is: 'slicer' and remark is: 'select all', then no parameters should be applied to the query.
		if param.Type == "slicer" && param.Remark != "" {
			continue
		}
		params[param.Param] = param.Value
	}

	var query bytes.Buffer
	err = tmpl.Execute(&query, params)
	if err != nil {
		return "", err
	}
	return query.String(), nil
}

func Query(c echo.Context) error {
	var queryRequest QueryRequest
	err := c.Bind(&queryRequest)
	if err != nil {
		return err
	}

	db, err := getConnection(queryRequest.SqlDataSource.ConnectionUrl)
	if err != nil {
		return err
	}

	query, err := replaceQueryParams(queryRequest.SqlQuery, queryRequest.FilterParams)
	if err != nil {
		return err
	}

	rows, err := db.Queryx(query)
	if err != nil {
		return err
	}
	defer rows.Close()

	columns, err := getColumns(rows)
	if err != nil {
		return err
	}

	results := make([]map[string]interface{}, 0)
	for rows.Next() {
		m := make(map[string]interface{})
		err := rows.MapScan(m)
		if err != nil {
			continue
		}
		results = append(results, m)
	}

	return c.JSON(http.StatusOK, QueryResponse{
		Columns: columns,
		Data:    results,
	})
}

func querySchema(db *sqlx.DB, schemaSQL string) ([]Table, error) {
	tables := make([]Table, 0)
	err := db.Select(&tables, schemaSQL)
	if err != nil {
		return nil, err
	}
	return tables, nil
}

func queryColumns(db *sqlx.DB, columnSQL string, schema string, table string) ([]Column, error) {
	columns := make([]Column, 0)
	err := db.Select(&columns, columnSQL, schema, table)
	if err != nil {
		return nil, err
	}
	return columns, nil
}

func Schema(c echo.Context) error {
	var dataSource SqlDataSource
	err := c.Bind(&dataSource)
	if err != nil {
		return err
	}
	db, err := getConnection(dataSource.ConnectionUrl)
	if err != nil {
		return err
	}

	var schemaSQL string

	if db.DriverName() == "chhttp" {
		schemaSQL = `
SELECT database as schema, name, engine as type
FROM system.tables
WHERE schema not in ('system', 'information_schema', 'INFORMATION_SCHEMA')
`
	} else if db.DriverName() == "sqlite" {
		schemaSQL = `
SELECT '' as schema, name, type
FROM sqlite_schema
WHERE type='table'
order by name
`
	} else if db.DriverName() == "postgres" {
		schemaSQL = `
SELECT table_schema as schema, table_name as name, table_type as type
FROM information_schema.tables
WHERE table_schema not in ('information_schema', 'pg_catalog')
order by table_schema, table_name
`
	} else {
		return fmt.Errorf("unsupported driver type: %s", db.DriverName())
	}

	tables, err := querySchema(db, schemaSQL)
	if err != nil {
		return err
	}

	var columnSQL string
	if db.DriverName() == "chhttp" {
		columnSQL = `
SELECT name, type, -1 as length
FROM system.columns
WHERE database = ? and table = ?
ORDER BY position ASC
`
	}

	if columnSQL != "" {
		for i, table := range tables {
			columns, err := queryColumns(db, columnSQL, table.Schema, table.Name)
			if err != nil {
				return err
			}
			tables[i].Columns = columns
		}
	}

	return c.JSON(http.StatusOK, tables)
}

func TransformErrorIntoJsonMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		err := next(c)
		if err != nil {
			res, _ := json.Marshal(ErrorResponse{Error: err.Error()})
			c.Response().Write(res)
		}
		return nil
	}
}

type GuandataColumn struct {
	Name   string `json:"name"`
	DbType string `json:"dbType" db:"type"`
	SeqNo  int64  `json:"seqNo" db:"seq_no"`
}

func QueryColumnsForChat2Answer(connectionUrl string, tableName string) ([]GuandataColumn, error) {
	db, err := getConnection(connectionUrl)
	if err != nil {
		return nil, err
	}
	columns := make([]GuandataColumn, 0)
	err = db.Select(&columns, "DESCRIBE "+tableName)
	if err != nil {
		return nil, err
	}
	return columns, nil
}

func QuerySQLforChat2Answer(connectionUrl string, sql string) (*QueryResponse, error) {
	db, err := getConnection(connectionUrl)
	if err != nil {
		return nil, err
	}

	rows, err := db.Queryx(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := getColumns(rows)
	if err != nil {
		return nil, err
	}

	results := make([]map[string]interface{}, 0)
	for rows.Next() {
		m := make(map[string]interface{})
		err := rows.MapScan(m)
		if err != nil {
			continue
		}
		results = append(results, m)
	}

	return &QueryResponse{
		Columns: columns,
		Data:    results,
	}, nil
}
