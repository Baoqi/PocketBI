package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("gwg0iwd3ri4qfoe")
		if err != nil {
			return err
		}

		collection.ListRule = types.Pointer("@request.auth.id = created_by.id")

		collection.ViewRule = types.Pointer("@request.auth.id = created_by.id")

		collection.CreateRule = types.Pointer("@request.auth.id = @request.data.created_by.id")

		collection.UpdateRule = types.Pointer("@request.auth.id = created_by.id")

		collection.DeleteRule = types.Pointer("@request.auth.id = created_by.id")

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("gwg0iwd3ri4qfoe")
		if err != nil {
			return err
		}

		collection.ListRule = nil

		collection.ViewRule = nil

		collection.CreateRule = nil

		collection.UpdateRule = nil

		collection.DeleteRule = nil

		return dao.SaveCollection(collection)
	})
}
