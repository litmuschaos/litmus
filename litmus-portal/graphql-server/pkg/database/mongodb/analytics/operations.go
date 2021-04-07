package analytics

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var (
	dataSourceCollection *mongo.Collection
	panelCollection      *mongo.Collection
	dashBoardCollection  *mongo.Collection
	backgroundContext    = context.Background()
)

func init() {
	dataSourceCollection = mongodb.Database.Collection("datasource-collection")
	panelCollection = mongodb.Database.Collection("panel-collection")
	dashBoardCollection = mongodb.Database.Collection("dashboard-collection")
}

// InsertDataSource takes details of a data source and inserts into the database collection
func InsertDataSource(datasource DataSource) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	_, err := dataSourceCollection.InsertOne(ctx, datasource)
	if err != nil {
		return err
	}

	return nil
}

// InsertDashBoard takes details of a dashboard and inserts into the database collection
func InsertDashBoard(dashboard DashBoard) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	_, err := dashBoardCollection.InsertOne(ctx, dashboard)
	if err != nil {
		return err
	}

	return nil
}

// InsertPanel takes details of a dashboard panel and inserts into the database collection
func InsertPanel(panels []*Panel) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
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

// ListDataSource takes a query parameter to retrieve the data source details from the database
func ListDataSource(query bson.M) ([]*DataSource, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	var datasources []*DataSource
	cursor, err := dataSourceCollection.Find(ctx, query)
	if err != nil {
		return []*DataSource{}, err
	}

	err = cursor.All(ctx, &datasources)
	if err != nil {
		return []*DataSource{}, err
	}

	return datasources, nil
}

// ListDashboard takes a query parameter to retrieve the dashboard details from the database
func ListDashboard(query bson.M) ([]*DashBoard, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	var dashboards []*DashBoard
	cursor, err := dashBoardCollection.Find(ctx, query)
	if err != nil {
		return []*DashBoard{}, err
	}

	err = cursor.All(ctx, &dashboards)
	if err != nil {
		return []*DashBoard{}, err
	}

	return dashboards, nil
}

// ListPanel takes a query parameter to retrieve the dashboard panel details from the database
func ListPanel(query bson.M) ([]*Panel, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	var panels []*Panel
	cursor, err := panelCollection.Find(ctx, query)
	if err != nil {
		return []*Panel{}, err
	}

	err = cursor.All(ctx, &panels)
	if err != nil {
		return []*Panel{}, err
	}

	return panels, nil
}

// GetDataSourceByID takes a dsID parameter to retrieve the data source details from the database
func GetDataSourceByID(dsID string) (*DataSource, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	query := bson.M{"ds_id": dsID}

	var datasource *DataSource
	err := dataSourceCollection.FindOne(ctx, query).Decode(&datasource)
	if err != nil {
		return nil, err
	}

	return datasource, nil
}

// UpdateDataSource takes query and update parameters to update the data source details in the database
func UpdateDataSource(query bson.D, update bson.D) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	_, err := dataSourceCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdateDashboard takes query and update parameters to update the dashboard details in the database
func UpdateDashboard(query bson.D, update bson.D) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	_, err := dashBoardCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdatePanel takes query and update parameters to update the dashboard panel details in the database
func UpdatePanel(query bson.D, update bson.D) error {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	updateResult, err := panelCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("Panel collection query didn't matched")
	}

	return nil
}

// GetDashboard takes a query parameter to retrieve the dashboard details from the database
func GetDashboard(query bson.M) (DashBoard, error) {
	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()
	var dashboard DashBoard
	err := dashBoardCollection.FindOne(ctx, query).Decode(&dashboard)
	if err != nil {
		return DashBoard{}, err
	}

	return dashboard, nil
}
