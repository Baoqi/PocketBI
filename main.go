package main

import (
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"log"
	"pocketbi/pkg/sqlquery"

	_ "pocketbi/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true, // auto creates migration files when making collection changes
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		subFs := echo.MustSubFS(e.Router.Filesystem, "pb_public")

		e.Router.POST("/sqlquery/ping", sqlquery.Ping, apis.RequireRecordAuth("users"), sqlquery.TransformErrorIntoJsonMiddleware, apis.ActivityLogger(app))
		e.Router.POST("/sqlquery/query", sqlquery.Query, apis.RequireRecordAuth("users"), sqlquery.TransformErrorIntoJsonMiddleware, apis.ActivityLogger(app))
		e.Router.POST("/sqlquery/schema", sqlquery.Schema, apis.RequireRecordAuth("users"), sqlquery.TransformErrorIntoJsonMiddleware, apis.ActivityLogger(app))

		e.Router.GET("/*", apis.StaticDirectoryHandler(subFs, true))

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
