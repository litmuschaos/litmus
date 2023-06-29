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

type Operator struct {
	operator mongodb.MongoOperator
}

func NewAnalyticsOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// InsertDataSource takes details of a data source and inserts into the database collection
func (a *Operator) InsertDataSource(datasource DataSource) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	err := a.operator.Create(ctx, mongodb.DataSourceCollection, datasource)
	if err != nil {
		return err
	}

	return nil
}

// InsertDashBoard takes details of a dashboard and inserts into the database collection
func (a *Operator) InsertDashBoard(dashboard DashBoard) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	err := a.operator.Create(ctx, mongodb.DashboardCollection, dashboard)
	if err != nil {
		return err
	}

	return nil
}

// InsertPanel takes details of a dashboard panel and inserts into the database collection
func (a *Operator) InsertPanel(panels []*Panel) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var panelList []interface{}
	for _, panel := range panels {
		panelList = append(panelList, panel)
	}

	err := a.operator.CreateMany(ctx, mongodb.PanelCollection, panelList)
	if err != nil {
		return err
	}

	return nil
}

// ListDataSource takes a query parameter to retrieve the data source details from the database
func (a *Operator) ListDataSource(query bson.D) ([]*DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dataSources []*DataSource
	results, err := a.operator.List(ctx, mongodb.DataSourceCollection, query)
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
func (a *Operator) ListDashboard(query bson.D) ([]*DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboards []*DashBoard
	results, err := a.operator.List(ctx, mongodb.DashboardCollection, query)
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
func (a *Operator) ListPanel(query bson.D) ([]*Panel, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var panels []*Panel
	results, err := a.operator.List(ctx, mongodb.PanelCollection, query)
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
func (a *Operator) GetDataSourceByID(dsID string) (*DataSource, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"ds_id", dsID}}

	var datasource *DataSource
	results, err := a.operator.Get(ctx, mongodb.DataSourceCollection, query)
	err = results.Decode(&datasource)
	if err != nil {
		return nil, err
	}

	return datasource, nil
}

// UpdateDataSource takes query and update parameters to update the data source details in the database
func (a *Operator) UpdateDataSource(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := a.operator.Update(ctx, mongodb.DataSourceCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdateDashboard takes query and update parameters to update the dashboard details in the database
func (a *Operator) UpdateDashboard(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := a.operator.Update(ctx, mongodb.DashboardCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdatePanel takes query and update parameters to update the dashboard panel details in the database
func (a *Operator) UpdatePanel(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	updateResult, err := a.operator.Update(ctx, mongodb.PanelCollection, query, update)
	if err != nil {
		return err
	}

	if updateResult.MatchedCount == 0 {
		return errors.New("panel collection query didn't matched")
	}

	return nil
}

// GetDashboard takes a query parameter to retrieve the dashboard details from the database
func (a *Operator) GetDashboard(query bson.D) (DashBoard, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var dashboard DashBoard
	result, err := a.operator.Get(ctx, mongodb.DashboardCollection, query)
	err = result.Decode(&dashboard)
	if err != nil {
		return DashBoard{}, err
	}

	return dashboard, nil
}
