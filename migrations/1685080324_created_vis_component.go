package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `{
			"id": "DWA57UhePCojhmV",
			"created": "2023-05-26 05:52:04.550Z",
			"updated": "2023-05-26 05:52:04.550Z",
			"name": "vis_component",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "mfjusnyl",
					"name": "report_id",
					"type": "relation",
					"required": true,
					"unique": false,
					"options": {
						"collectionId": "b6OdmiAkF30s3Ay",
						"cascadeDelete": true,
						"minSelect": null,
						"maxSelect": 1,
						"displayFields": null
					}
				},
				{
					"system": false,
					"id": "viw1rdq4",
					"name": "title",
					"type": "text",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "zppmhtss",
					"name": "x",
					"type": "number",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null
					}
				},
				{
					"system": false,
					"id": "1xlqgabi",
					"name": "y",
					"type": "number",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null
					}
				},
				{
					"system": false,
					"id": "aez1rjrq",
					"name": "width",
					"type": "number",
					"required": true,
					"unique": false,
					"options": {
						"min": null,
						"max": null
					}
				},
				{
					"system": false,
					"id": "aqnq1zdu",
					"name": "height",
					"type": "number",
					"required": true,
					"unique": false,
					"options": {
						"min": null,
						"max": null
					}
				},
				{
					"system": false,
					"id": "xknzxpgr",
					"name": "type",
					"type": "text",
					"required": true,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "q46txar7",
					"name": "sub_type",
					"type": "text",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "vyrd0mvx",
					"name": "sql_query",
					"type": "text",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "siwsojtq",
					"name": "jdbc_data_source_id",
					"type": "relation",
					"required": false,
					"unique": false,
					"options": {
						"collectionId": "zRMjLTG2W5CsQFd",
						"cascadeDelete": true,
						"minSelect": null,
						"maxSelect": 1,
						"displayFields": null
					}
				},
				{
					"system": false,
					"id": "pihglwpo",
					"name": "data",
					"type": "json",
					"required": false,
					"unique": false,
					"options": {}
				},
				{
					"system": false,
					"id": "em2lopc6",
					"name": "style",
					"type": "json",
					"required": false,
					"unique": false,
					"options": {}
				},
				{
					"system": false,
					"id": "ugmxm8sk",
					"name": "drill_through",
					"type": "json",
					"required": false,
					"unique": false,
					"options": {}
				}
			],
			"indexes": [
				"CREATE INDEX ` + "`" + `vis_component_created_idx` + "`" + ` ON ` + "`" + `vis_component` + "`" + ` (` + "`" + `created` + "`" + `)"
			],
			"listRule": "@request.auth.id != \"\"",
			"viewRule": "@request.auth.id != \"\"",
			"createRule": "@request.auth.id != \"\"",
			"updateRule": "@request.auth.id != \"\"",
			"deleteRule": "@request.auth.id != \"\"",
			"options": {}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("DWA57UhePCojhmV")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
