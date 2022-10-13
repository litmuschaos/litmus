package authorization

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// RoleQuery states the query for the roles
type RoleQuery string

const (
	UserClusterReg               RoleQuery = "userClusterReg"
	CreateChaosWorkFlow          RoleQuery = "CreateChaosWorkFlow"
	ReRunChaosWorkFlow           RoleQuery = "ReRunChaosWorkFlow"
	DeleteChaosWorkflow          RoleQuery = "DeleteChaosWorkflow"
	TerminateChaosWorkflow       RoleQuery = "TerminateChaosWorkflow"
	SyncWorkflow                 RoleQuery = "SyncWorkflow"
	SendInvitation               RoleQuery = "SendInvitation"
	AcceptInvitation             RoleQuery = "AcceptInvitation"
	DeclineInvitation            RoleQuery = "DeclineInvitation"
	RemoveInvitation             RoleQuery = "RemoveInvitation"
	LeaveProject                 RoleQuery = "LeaveProject"
	UpdateProjectName            RoleQuery = "UpdateProjectName"
	AddMyHub                     RoleQuery = "AddMyHub"
	SyncHub                      RoleQuery = "SyncHub"
	UpdateChaosWorkflow          RoleQuery = "UpdateChaosWorkflow"
	DeleteClusters               RoleQuery = "DeleteClusters"
	UpdateMyHub                  RoleQuery = "UpdateMyHub"
	DeleteMyHub                  RoleQuery = "DeleteMyHub"
	EnableGitOps                 RoleQuery = "EnableGitOps"
	DisableGitOps                RoleQuery = "DisableGitOps"
	UpdateGitOps                 RoleQuery = "UpdateGitOps"
	CreateDataSource             RoleQuery = "CreateDataSource"
	CreateDashBoard              RoleQuery = "CreateDashBoard"
	UpdateDataSource             RoleQuery = "UpdateDataSource"
	UpdateDashboard              RoleQuery = "UpdateDashboard"
	DeleteDashboard              RoleQuery = "DeleteDashboard"
	DeleteDataSource             RoleQuery = "DeleteDataSource"
	ListWorkflowRuns             RoleQuery = "ListWorkflowRuns"
	ListClusters                 RoleQuery = "ListClusters"
	GetManifest                  RoleQuery = "GetManifest"
	GetAgentDetails              RoleQuery = "GetAgentDetails"
	GetProject                   RoleQuery = "GetProject"
	ListHeatmapData              RoleQuery = "ListHeatmapData"
	ListWorkflowStats            RoleQuery = "ListWorkflowStats"
	ListCharts                   RoleQuery = "ListCharts"
	GetHubExperiment             RoleQuery = "GetHubExperiment"
	GetWorkflowRunStats          RoleQuery = "GetWorkflowRunStats"
	ListHubStatus                RoleQuery = "ListHubStatus"
	ListPortalDashboardData      RoleQuery = "ListPortalDashboardData"
	ListWorkflow                 RoleQuery = "ListWorkflow"
	SaveMyHub                    RoleQuery = "SaveMyHub"
	CreateWorkflowTemplate       RoleQuery = "CreateWorkflowTemplate"
	DeleteWorkflowTemplate       RoleQuery = "DeleteWorkflowTemplate"
	CreateImageRegistry          RoleQuery = "CreateImageRegistry"
	UpdateImageRegistry          RoleQuery = "UpdateImageRegistry"
	DeleteImageRegistry          RoleQuery = "DeleteImageRegistry"
	GetYAMLData                  RoleQuery = "GetYAMLData"
	PredefinedWorkflowOperations RoleQuery = "PredefinedWorkflowOperations"
	ListPredefinedWorkflows      RoleQuery = "ListPredefinedWorkflows"
	GetPredefinedExperimentYaml  RoleQuery = "GetPredefinedExperimentYaml"
	GetExperimentDetails         RoleQuery = "GetExperimentDetails"
	ListDataSource               RoleQuery = "ListDataSource"
	ListDashboard                RoleQuery = "ListDashboard"
	GetGitOpsDetails             RoleQuery = "GetGitOpsDetails"
	ListWorkflowManifests        RoleQuery = "ListWorkflowManifests"
	GetWorkflowManifestByID      RoleQuery = "GetWorkflowManifestByID"
	ListImageRegistry            RoleQuery = "ListImageRegistry"
	GetImageRegistry             RoleQuery = "GetImageRegistry"

	MemberRoleOwnerString  = string(model.MemberRoleOwner)
	MemberRoleEditorString = string(model.MemberRoleEditor)
	MemberRoleViewerString = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserClusterReg:         {MemberRoleOwnerString, MemberRoleEditorString},
	CreateChaosWorkFlow:    {MemberRoleOwnerString, MemberRoleEditorString},
	ReRunChaosWorkFlow:     {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosWorkflow:    {MemberRoleOwnerString, MemberRoleEditorString},
	TerminateChaosWorkflow: {MemberRoleOwnerString, MemberRoleEditorString},
	SyncWorkflow:           {MemberRoleOwnerString, MemberRoleEditorString},
	SendInvitation:         {MemberRoleOwnerString},
	AcceptInvitation:       {MemberRoleViewerString, MemberRoleEditorString},
	DeclineInvitation:      {MemberRoleViewerString, MemberRoleEditorString},
	RemoveInvitation:       {MemberRoleOwnerString},
	LeaveProject:           {MemberRoleViewerString, MemberRoleEditorString},
	UpdateProjectName:      {MemberRoleOwnerString},
	AddMyHub:               {MemberRoleOwnerString, MemberRoleEditorString},
	SyncHub:                {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosWorkflow:    {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteClusters:         {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateMyHub:            {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteMyHub:            {MemberRoleOwnerString, MemberRoleEditorString},
	EnableGitOps:           {MemberRoleOwnerString},
	DisableGitOps:          {MemberRoleOwnerString},
	UpdateGitOps:           {MemberRoleOwnerString},
	CreateDataSource:       {MemberRoleOwnerString, MemberRoleEditorString},
	CreateDashBoard:        {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateDataSource:       {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateDashboard:        {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteDashboard:        {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteDataSource:       {MemberRoleOwnerString, MemberRoleEditorString},
	ListWorkflowRuns:       {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListClusters: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetManifest:     {MemberRoleOwnerString, MemberRoleEditorString},
	GetAgentDetails: {MemberRoleOwnerString, MemberRoleEditorString},
	GetProject: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	ListHeatmapData:              {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListWorkflowStats:            {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListCharts:                   {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetHubExperiment:             {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowRunStats:          {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListHubStatus:                {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListPortalDashboardData:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListWorkflow:                 {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	SaveMyHub:                    {MemberRoleOwnerString, MemberRoleEditorString},
	CreateWorkflowTemplate:       {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteWorkflowTemplate:       {MemberRoleOwnerString, MemberRoleEditorString},
	CreateImageRegistry:          {MemberRoleOwnerString},
	UpdateImageRegistry:          {MemberRoleOwnerString},
	DeleteImageRegistry:          {MemberRoleOwnerString},
	GetYAMLData:                  {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	PredefinedWorkflowOperations: {MemberRoleOwnerString, MemberRoleEditorString},
	ListPredefinedWorkflows:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetPredefinedExperimentYaml:  {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListDataSource:               {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListDashboard:                {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetGitOpsDetails:             {MemberRoleOwnerString},
	ListWorkflowManifests:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetExperimentDetails:         {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowManifestByID:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListImageRegistry:            {MemberRoleOwnerString},
	GetImageRegistry:             {MemberRoleOwnerString},
}
