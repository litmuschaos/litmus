package operations

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
)

var (
	dataSourceCollection *mongo.Collection
	panelCollection      *mongo.Collection
	dashBoardCollection  *mongo.Collection
)

func init() {
	dataSourceCollection = mongodb.Database.Collection("datasource-collection")
	panelCollection = mongodb.Database.Collection("panel-collection")
	dashBoardCollection = mongodb.Database.Collection("dashboard-collection")
}

func InsertDataSource(datasource dbSchema.DataSource) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := dataSourceCollection.InsertOne(ctx, datasource)
	if err != nil {
		return err
	}

	return nil
}

func InsertDashBoard(dashboard dbSchema.DashBoard) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := dashBoardCollection.InsertOne(ctx, dashboard)
	if err != nil {
		return err
	}

	return nil
}

func InsertPanel(panels []*dbSchema.Panel) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var newInterface []interface{}
	for _, panel := range panels {
		newInterface = append(newInterface, panel)
	}

	_, err := panelCollection.InsertMany(ctx, newInterface)
	if err != nil {
		return err
	}

	return nil
}

func ListDataSource(query bson.M) ([]*dbSchema.DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var datasources []*dbSchema.DataSource
	cursor, err := dataSourceCollection.Find(ctx, query)
	if err != nil {
		return []*dbSchema.DataSource{}, err
	}

	err = cursor.All(ctx, &datasources)
	if err != nil {
		return []*dbSchema.DataSource{}, err
	}

	return datasources, nil
}

func ListDashboard(query bson.M) ([]*dbSchema.DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboards []*dbSchema.DashBoard
	cursor, err := dashBoardCollection.Find(ctx, query)
	if err != nil {
		return []*dbSchema.DashBoard{}, err
	}

	err = cursor.All(ctx, &dashboards)
	if err != nil {
		return []*dbSchema.DashBoard{}, err
	}

	return dashboards, nil
}

func ListPanel(query bson.M) ([]*dbSchema.Panel, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var panels []*dbSchema.Panel
	cursor, err := panelCollection.Find(ctx, query)
	if err != nil {
		return []*dbSchema.Panel{}, err
	}

	err = cursor.All(ctx, &panels)
	if err != nil {
		return []*dbSchema.Panel{}, err
	}

	return panels, nil
}

func GetDataSourceByID(ds_id string) (*dbSchema.DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"ds_id": ds_id}

	var datasource *dbSchema.DataSource
	err := dataSourceCollection.FindOne(ctx, query).Decode(&datasource)
	if err != nil {
		return nil, err
	}

	return datasource, nil
}

func UpdateDataSource(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := dataSourceCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

func UpdateDashboard(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := dashBoardCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

func UpdatePanel(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	updateResult, err := panelCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("Panel collection query didn't matched")
	}

	return nil
}

func GetDashboard(query bson.M) (dbSchema.DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboard dbSchema.DashBoard
	err := dashBoardCollection.FindOne(ctx, query).Decode(&dashboard)
	if err != nil {
		return dbSchema.DashBoard{}, err
	}

	return dashboard, nil
}
