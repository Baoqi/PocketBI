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
			"id": "zRMjLTG2W5CsQFd",
			"created": "2023-05-26 05:52:04.550Z",
			"updated": "2023-05-26 05:52:04.550Z",
			"name": "vis_datasource",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "2lm4jhwy",
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
					"id": "jpivtciq",
					"name": "username",
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
					"id": "nwgprlit",
					"name": "password",
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
					"id": "1shbpkax",
					"name": "connection_url",
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
					"id": "aphkr2ot",
					"name": "driver_class_name",
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
					"id": "ruslibda",
					"name": "ping",
					"type": "text",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				}
			],
			"indexes": [
				"CREATE INDEX ` + "`" + `vis_datasource_created_idx` + "`" + ` ON ` + "`" + `vis_datasource` + "`" + ` (` + "`" + `created` + "`" + `)",
				"CREATE UNIQUE INDEX \"idx_unique_2lm4jhwy\" on \"vis_datasource\" (\"name\")"
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

		collection, err := dao.FindCollectionByNameOrId("zRMjLTG2W5CsQFd")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
