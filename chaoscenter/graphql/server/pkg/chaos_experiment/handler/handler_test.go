package handler

import (
	"context"
	"reflect"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	types "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	chaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/choas_experiment_run"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	chaosExperimentService     = new(types.Service)
	chaosExperimentRunService  = new(chaosExperimentRun.Service)
	infrastructureService      = new(chaos_infrastructure.Service)
	gitOpsService              = new(gitops.Service)
	chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(*mongodbOperator)
	chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(*mongodbOperator)
	mongodbOperator            = new(mongodb.MongoOperator)
)

var chaosExperimentHandler = NewChaosExperimentHandler(*chaosExperimentService, *chaosExperimentRunService, *infrastructureService, *gitOpsService, chaosExperimentOperator, chaosExperimentRunOperator, *mongodbOperator)

func TestNewChaosExperimentHandler(t *testing.T) {
	type args struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	tests := []struct {
		name string
		args args
		want *ChaosExperimentHandler
	}{
		{
			name: "NewChaosExperimentHandler",
			args: args{
				chaosExperimentService:     *chaosExperimentService,
				chaosExperimentRunService:  *chaosExperimentRunService,
				infrastructureService:      *infrastructureService,
				gitOpsService:              *gitOpsService,
				chaosExperimentOperator:    chaosExperimentOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				mongodbOperator:            *mongodbOperator,
			},
			want: &ChaosExperimentHandler{
				chaosExperimentService:     *chaosExperimentService,
				chaosExperimentRunService:  *chaosExperimentRunService,
				infrastructureService:      *infrastructureService,
				gitOpsService:              *gitOpsService,
				chaosExperimentOperator:    chaosExperimentOperator,
				chaosExperimentRunOperator: chaosExperimentRunOperator,
				mongodbOperator:            *mongodbOperator,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NewChaosExperimentHandler(tt.args.chaosExperimentService, tt.args.chaosExperimentRunService, tt.args.infrastructureService, tt.args.gitOpsService, tt.args.chaosExperimentOperator, tt.args.chaosExperimentRunOperator, tt.args.mongodbOperator); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewChaosExperimentHandler() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_SaveChaosExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		request   model.SaveChaosExperimentRequest
		projectID string
		r         *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    string
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.SaveChaosExperiment(tt.args.ctx, tt.args.request, tt.args.projectID, tt.args.r)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.SaveChaosExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ChaosExperimentHandler.SaveChaosExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_CreateChaosExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		request   *model.ChaosExperimentRequest
		projectID string
		r         *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    *model.ChaosExperimentResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.CreateChaosExperiment(tt.args.ctx, tt.args.request, tt.args.projectID, tt.args.r)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.CreateChaosExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.CreateChaosExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_DeleteChaosExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx           context.Context
		projectID     string
		workflowID    string
		workflowRunID *string
		r             *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    bool
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.DeleteChaosExperiment(tt.args.ctx, tt.args.projectID, tt.args.workflowID, tt.args.workflowRunID, tt.args.r)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.DeleteChaosExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ChaosExperimentHandler.DeleteChaosExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_UpdateChaosExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		request   *model.ChaosExperimentRequest
		projectID string
		r         *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    *model.ChaosExperimentResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.UpdateChaosExperiment(tt.args.ctx, tt.args.request, tt.args.projectID, tt.args.r)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.UpdateChaosExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.UpdateChaosExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_GetExperiment(t *testing.T) {

	projectID := uuid.New().String()
	experimentID := uuid.New().String()
	type args struct {
		ctx          context.Context
		projectID    string
		experimentID string
	}
	tests := []struct {
		name    string
		args    args
		want    *model.GetExperimentResponse
		wantErr bool
	}{
		{
			name: "Get Experiment",
			args: args{
				ctx:          context.Background(),
				projectID:    projectID,
				experimentID: experimentID,
			},
			want: &model.GetExperimentResponse{
				ExperimentDetails: &model.Experiment{
					ProjectID:    projectID,
					ExperimentID: experimentID,
				},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := chaosExperimentHandler.GetExperiment(tt.args.ctx, tt.args.projectID, tt.args.experimentID)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.GetExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.GetExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_ListExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		projectID string
		request   model.ListExperimentRequest
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    *model.ListExperimentResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.ListExperiment(tt.args.projectID, tt.args.request)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.ListExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.ListExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_getWfRunDetails(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		workflowIDs []string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    map[string]*types.LastRunDetails
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.getWfRunDetails(tt.args.workflowIDs)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.getWfRunDetails() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.getWfRunDetails() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_DisableCronExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		username   string
		experiment dbChaosExperiment.ChaosExperimentRequest
		projectID  string
		r          *store.StateData
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			if err := c.DisableCronExperiment(tt.args.username, tt.args.experiment, tt.args.projectID, tt.args.r); (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.DisableCronExperiment() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestChaosExperimentHandler_GetExperimentStats(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		ctx       context.Context
		projectID string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    *model.GetExperimentStatsResponse
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.GetExperimentStats(tt.args.ctx, tt.args.projectID)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.GetExperimentStats() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.GetExperimentStats() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestChaosExperimentHandler_GetLogs(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		reqID string
		pod   model.PodLogRequest
		r     store.StateData
	}
	tests := []struct {
		name   string
		fields fields
		args   args
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			c.GetLogs(tt.args.reqID, tt.args.pod, tt.args.r)
		})
	}
}

func TestChaosExperimentHandler_GetKubeObjData(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		reqID      string
		kubeObject model.KubeObjectRequest
		r          store.StateData
	}
	tests := []struct {
		name   string
		fields fields
		args   args
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			c.GetKubeObjData(tt.args.reqID, tt.args.kubeObject, tt.args.r)
		})
	}
}

func TestChaosExperimentHandler_GetDBExperiment(t *testing.T) {
	type fields struct {
		chaosExperimentService     types.Service
		chaosExperimentRunService  chaosExperimentRun.Service
		infrastructureService      chaos_infrastructure.Service
		gitOpsService              gitops.Service
		chaosExperimentOperator    *dbChaosExperiment.Operator
		chaosExperimentRunOperator *dbChaosExperimentRun.Operator
		mongodbOperator            mongodb.MongoOperator
	}
	type args struct {
		query bson.D
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    dbChaosExperiment.ChaosExperimentRequest
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &ChaosExperimentHandler{
				chaosExperimentService:     tt.fields.chaosExperimentService,
				chaosExperimentRunService:  tt.fields.chaosExperimentRunService,
				infrastructureService:      tt.fields.infrastructureService,
				gitOpsService:              tt.fields.gitOpsService,
				chaosExperimentOperator:    tt.fields.chaosExperimentOperator,
				chaosExperimentRunOperator: tt.fields.chaosExperimentRunOperator,
				mongodbOperator:            tt.fields.mongodbOperator,
			}
			got, err := c.GetDBExperiment(tt.args.query)
			if (err != nil) != tt.wantErr {
				t.Errorf("ChaosExperimentHandler.GetDBExperiment() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ChaosExperimentHandler.GetDBExperiment() = %v, want %v", got, tt.want)
			}
		})
	}
}
