package biz

import (
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"net/http"
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
