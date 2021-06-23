package analytics

import (
	"context"
	"errors"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	backgroundContext = context.Background()
)

// InsertDataSource takes details of a data source and inserts into the database collection
func InsertDataSource(datasource DataSource) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	err := mongodb.Operator.Create(ctx, mongodb.DataSourceCollection, datasource)
	if err != nil {
		return err
	}

	return nil
}

// InsertDashBoard takes details of a dashboard and inserts into the database collection
func InsertDashBoard(dashboard DashBoard) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	err := mongodb.Operator.Create(ctx, mongodb.DashboardCollection, dashboard)
	if err != nil {
		return err
	}

	return nil
}

// InsertPanel takes details of a dashboard panel and inserts into the database collection
func InsertPanel(panels []*Panel) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var panelList []interface{}
	for _, panel := range panels {
		panelList = append(panelList, panel)
	}

	err := mongodb.Operator.CreateMany(ctx, mongodb.PanelCollection, panelList)
	if err != nil {
		return err
	}

	return nil
}

// ListDataSource takes a query parameter to retrieve the data source details from the database
func ListDataSource(query bson.D) ([]*DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dataSources []*DataSource
	results, err := mongodb.Operator.List(ctx, mongodb.DataSourceCollection, query)
	if err != nil {
		return []*DataSource{}, err
	}

	err = results.All(ctx, &dataSources)
	if err != nil {
		return []*DataSource{}, err
	}

	return dataSources, nil
}

// ListDashboard takes a query parameter to retrieve the dashboard details from the database
func ListDashboard(query bson.D) ([]*DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboards []*DashBoard
	results, err := mongodb.Operator.List(ctx, mongodb.DashboardCollection, query)
	if err != nil {
		return []*DashBoard{}, err
	}

	err = results.All(ctx, &dashboards)
	if err != nil {
		return []*DashBoard{}, err
	}

	return dashboards, nil
}

// ListPanel takes a query parameter to retrieve the dashboard panel details from the database
func ListPanel(query bson.D) ([]*Panel, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var panels []*Panel
	results, err := mongodb.Operator.List(ctx, mongodb.PanelCollection, query)
	if err != nil {
		return []*Panel{}, err
	}

	err = results.All(ctx, &panels)
	if err != nil {
		return []*Panel{}, err
	}

	return panels, nil
}

// GetDataSourceByID takes a dsID parameter to retrieve the data source details from the database
func GetDataSourceByID(dsID string) (*DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"ds_id", dsID}}

	var datasource *DataSource
	results, err := mongodb.Operator.Get(ctx, mongodb.DataSourceCollection, query)
	err = results.Decode(&datasource)
	if err != nil {
		return nil, err
	}

	return datasource, nil
}

// UpdateDataSource takes query and update parameters to update the data source details in the database
func UpdateDataSource(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := mongodb.Operator.Update(ctx, mongodb.DataSourceCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdateDashboard takes query and update parameters to update the dashboard details in the database
func UpdateDashboard(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := mongodb.Operator.Update(ctx, mongodb.DashboardCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdatePanel takes query and update parameters to update the dashboard panel details in the database
func UpdatePanel(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	updateResult, err := mongodb.Operator.Update(ctx, mongodb.PanelCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("panel collection query didn't matched")
	}

	return nil
}

// GetDashboard takes a query parameter to retrieve the dashboard details from the database
func GetDashboard(query bson.D) (DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboard DashBoard
	result, err := mongodb.Operator.Get(ctx, mongodb.DashboardCollection, query)
	err = result.Decode(&dashboard)
	if err != nil {
		return DashBoard{}, err
	}

	return dashboard, nil
}
