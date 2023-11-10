package authorization

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// RoleQuery states the query for the roles
type RoleQuery string

const (
	UserInfrastructureReg        RoleQuery = "userInfrastructureReg"
	CreateChaosWorkFlow          RoleQuery = "CreateChaosWorkFlow"
	ReRunChaosWorkFlow           RoleQuery = "ReRunChaosWorkFlow"
	DeleteChaosWorkflow          RoleQuery = "DeleteChaosWorkflow"
	StopChaosExperiment          RoleQuery = "StopChaosExperiment"
	TerminateChaosWorkflow       RoleQuery = "TerminateChaosWorkflow"
	SyncWorkflow                 RoleQuery = "SyncWorkflow"
	SendInvitation               RoleQuery = "SendInvitation"
	AcceptInvitation             RoleQuery = "AcceptInvitation"
	DeclineInvitation            RoleQuery = "DeclineInvitation"
	RemoveInvitation             RoleQuery = "RemoveInvitation"
	LeaveProject                 RoleQuery = "LeaveProject"
	UpdateProjectName            RoleQuery = "UpdateProjectName"
	AddChaosHub                  RoleQuery = "AddChaosHub"
	SyncHub                      RoleQuery = "SyncChaosHub"
	UpdateChaosWorkflow          RoleQuery = "UpdateChaosWorkflow"
	DeleteInfrastructures        RoleQuery = "DeleteInfrastructures"
	UpdateChaosHub               RoleQuery = "UpdateChaosHub"
	DeleteChaosHub               RoleQuery = "DeleteChaosHub"
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
	GetWorkflowRun               RoleQuery = "GetWorkflowRun"
	ListInfrastructures          RoleQuery = "ListInfrastructures"
	GetInfrastructure            RoleQuery = "GetInfrastructure "
	GetManifest                  RoleQuery = "GetManifest"
	GetInfraDetails              RoleQuery = "GetInfraDetails"
	GetProject                   RoleQuery = "GetProject"
	ListHeatmapData              RoleQuery = "ListHeatmapData"
	ListWorkflowStats            RoleQuery = "ListWorkflowStats"
	ListCharts                   RoleQuery = "ListCharts"
	GetHubExperiment             RoleQuery = "GetChaosFault"
	GetWorkflowRunStats          RoleQuery = "GetWorkflowRunStats"
	ListHubStatus                RoleQuery = "ListChaosHubs"
	ListPortalDashboardData      RoleQuery = "ListPortalDashboardData"
	ListWorkflow                 RoleQuery = "ListWorkflow"
	SaveChaosHub                 RoleQuery = "SaveChaosHub"
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
	CreateEnvironment            RoleQuery = "CreateEnvironment"
	UpdateEnvironment            RoleQuery = "UpdateEnvironment"
	DeleteEnvironment            RoleQuery = "DeleteEnvironment"
	GetEnvironment               RoleQuery = "GetEnvironment"
	ListEnvironments             RoleQuery = "ListEnvironments"
	AddProbe                     RoleQuery = "AddProbe"
	DeleteProbe                  RoleQuery = "DeleteProbe"
	UpdateProbe                  RoleQuery = "UpdateProbe"
	GetProbe                     RoleQuery = "GetProbe"
	ListProbes                   RoleQuery = "ListProbes"
	MemberRoleOwnerString                  = string(model.MemberRoleOwner)
	MemberRoleEditorString                 = string(model.MemberRoleEditor)
	MemberRoleViewerString                 = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserInfrastructureReg: {MemberRoleOwnerString, MemberRoleEditorString},
	CreateChaosWorkFlow:   {MemberRoleOwnerString, MemberRoleEditorString},
	ReRunChaosWorkFlow:    {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosWorkflow:   {MemberRoleOwnerString, MemberRoleEditorString},
	StopChaosExperiment:   {MemberRoleOwnerString, MemberRoleEditorString},
	SyncWorkflow:          {MemberRoleOwnerString, MemberRoleEditorString},
	SendInvitation:        {MemberRoleOwnerString},
	AcceptInvitation:      {MemberRoleViewerString, MemberRoleEditorString},
	DeclineInvitation:     {MemberRoleViewerString, MemberRoleEditorString},
	RemoveInvitation:      {MemberRoleOwnerString},
	LeaveProject:          {MemberRoleViewerString, MemberRoleEditorString},
	UpdateProjectName:     {MemberRoleOwnerString},
	AddChaosHub:           {MemberRoleOwnerString, MemberRoleEditorString},
	SyncHub:               {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosWorkflow:   {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteInfrastructures: {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	EnableGitOps:          {MemberRoleOwnerString},
	DisableGitOps:         {MemberRoleOwnerString},
	UpdateGitOps:          {MemberRoleOwnerString},
	CreateDataSource:      {MemberRoleOwnerString, MemberRoleEditorString},
	CreateDashBoard:       {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateDataSource:      {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateDashboard:       {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteDashboard:       {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteDataSource:      {MemberRoleOwnerString, MemberRoleEditorString},
	ListWorkflowRuns:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowRun:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListInfrastructures: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetInfrastructure: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetManifest:     {MemberRoleOwnerString, MemberRoleEditorString},
	GetInfraDetails: {MemberRoleOwnerString, MemberRoleEditorString},
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
	SaveChaosHub:                 {MemberRoleOwnerString, MemberRoleEditorString},
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
	CreateEnvironment:            {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateEnvironment:            {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteEnvironment:            {MemberRoleOwnerString, MemberRoleEditorString},
	GetEnvironment:               {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListEnvironments:             {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	AddProbe:                     {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateProbe:                  {MemberRoleOwnerString, MemberRoleEditorString},
	GetProbe:                     {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListProbes:                   {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	DeleteProbe:                  {MemberRoleOwnerString, MemberRoleEditorString},
}
