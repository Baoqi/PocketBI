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
			"id": "zgaekou3yst0qlq",
			"created": "2023-06-02 08:12:21.235Z",
			"updated": "2023-06-02 08:12:21.235Z",
			"name": "vis_shared_report",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "nhro6im2",
					"name": "report_id",
					"type": "relation",
					"required": true,
					"unique": false,
					"options": {
						"collectionId": "gwg0iwd3ri4qfoe",
						"cascadeDelete": false,
						"minSelect": null,
						"maxSelect": 1,
						"displayFields": []
					}
				},
				{
					"system": false,
					"id": "fpjscjsu",
					"name": "created_by",
					"type": "relation",
					"required": true,
					"unique": false,
					"options": {
						"collectionId": "_pb_users_auth_",
						"cascadeDelete": false,
						"minSelect": null,
						"maxSelect": 1,
						"displayFields": []
					}
				}
			],
			"indexes": [],
			"listRule": "@request.auth.id = created_by.id",
			"viewRule": "@request.auth.id = created_by.id",
			"createRule": "@request.auth.id = @request.data.created_by.id",
			"updateRule": "@request.auth.id = created_by.id",
			"deleteRule": "@request.auth.id = created_by.id",
			"options": {}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("zgaekou3yst0qlq")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
