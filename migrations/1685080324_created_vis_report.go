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
			"id": "b6OdmiAkF30s3Ay",
			"created": "2023-05-26 05:52:04.550Z",
			"updated": "2023-05-26 05:52:04.550Z",
			"name": "vis_report",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "eqychtcz",
					"name": "name",
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
					"id": "nz6icjn8",
					"name": "project",
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
					"id": "7ahr59nl",
					"name": "style",
					"type": "json",
					"required": false,
					"unique": false,
					"options": {}
				}
			],
			"indexes": [
				"CREATE INDEX ` + "`" + `vis_report_created_idx` + "`" + ` ON ` + "`" + `vis_report` + "`" + ` (` + "`" + `created` + "`" + `)",
				"CREATE UNIQUE INDEX \"idx_unique_eqychtcz\" on \"vis_report\" (\"name\")"
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

		collection, err := dao.FindCollectionByNameOrId("b6OdmiAkF30s3Ay")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
