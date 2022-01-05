package authorization

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// RoleQuery states the query for the roles
type RoleQuery string

const (
	UserClusterReg         RoleQuery = "userClusterReg"
	CreateChaosWorkFlow    RoleQuery = "CreateChaosWorkFlow"
	SendInvitation         RoleQuery = "SendInvitation"
	AcceptInvitation       RoleQuery = "AcceptInvitation"
	DeclineInvitation      RoleQuery = "DeclineInvitation"
	RemoveInvitation       RoleQuery = "RemoveInvitation"
	LeaveProject           RoleQuery = "LeaveProject"
	UpdateProjectName      RoleQuery = "UpdateProjectName"
	AddMyHub               RoleQuery = "AddMyHub"
	UpdateChaosWorkflow    RoleQuery = "UpdateChaosWorkflow"
	UpdateMyHub            RoleQuery = "UpdateMyHub"
	EnableGitOps           RoleQuery = "EnableGitOps"
	DisableGitOps          RoleQuery = "DisableGitOps"
	UpdateGitOps           RoleQuery = "UpdateGitOps"
	CreateDataSource       RoleQuery = "CreateDataSource"
	CreateDashBoard        RoleQuery = "CreateDashBoard"
	UpdateDataSource       RoleQuery = "UpdateDataSource"
	GetWorkflowRuns        RoleQuery = "GetWorkflowRuns"
	GetCluster             RoleQuery = "GetCluster"
	GetManifest            RoleQuery = "GetManifest"
	GetAgentDetails        RoleQuery = "GetAgentDetails"
	GetProject             RoleQuery = "GetProject"
	GetHeatmapData         RoleQuery = "GetHeatmapData"
	GetWorkflowStats       RoleQuery = "GetWorkflowStats"
	GetCharts              RoleQuery = "GetCharts"
	GetHubExperiment       RoleQuery = "GetHubExperiment"
	GetWorkflowRunStats    RoleQuery = "GetWorkflowRunStats"
	GetHubStatus           RoleQuery = "GetHubStatus"
	PortalDashboardData    RoleQuery = "PortalDashboardData"
	ListWorkflow           RoleQuery = "ListWorkflow"
	SaveMyHub              RoleQuery = "SaveMyHub"
	CreateManifestTemplate RoleQuery = "CreateManifestTemplate"

	MemberRoleOwnerString  = string(model.MemberRoleOwner)
	MemberRoleEditorString = string(model.MemberRoleEditor)
	MemberRoleViewerString = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserClusterReg:      {MemberRoleOwnerString, MemberRoleEditorString},
	CreateChaosWorkFlow: {MemberRoleOwnerString, MemberRoleEditorString},
	SendInvitation:      {MemberRoleOwnerString},
	AcceptInvitation:    {MemberRoleViewerString, MemberRoleEditorString},
	DeclineInvitation:   {MemberRoleViewerString, MemberRoleEditorString},
	RemoveInvitation:    {MemberRoleOwnerString},
	LeaveProject:        {MemberRoleViewerString, MemberRoleEditorString},
	UpdateProjectName:   {MemberRoleOwnerString},
	AddMyHub:            {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosWorkflow: {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateMyHub:         {MemberRoleOwnerString, MemberRoleEditorString},
	EnableGitOps:        {MemberRoleOwnerString},
	DisableGitOps:       {MemberRoleOwnerString},
	UpdateGitOps:        {MemberRoleOwnerString},
	CreateDataSource:    {MemberRoleOwnerString, MemberRoleEditorString},
	CreateDashBoard:     {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateDataSource:    {MemberRoleOwnerString, MemberRoleEditorString},
	GetWorkflowRuns:     {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetCluster: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetManifest:     {MemberRoleOwnerString, MemberRoleEditorString},
	GetAgentDetails: {MemberRoleOwnerString, MemberRoleEditorString},
	GetProject: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetHeatmapData:         {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowStats:       {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetCharts:              {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetHubExperiment:       {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowRunStats:    {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetHubStatus:           {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	PortalDashboardData:    {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListWorkflow:           {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	SaveMyHub:              {MemberRoleOwnerString, MemberRoleEditorString},
	CreateManifestTemplate: {MemberRoleOwnerString, MemberRoleEditorString},
}
