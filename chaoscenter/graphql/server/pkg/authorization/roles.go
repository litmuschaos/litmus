package authorization

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// RoleQuery states the query for the roles
type RoleQuery string

const (
	UserInfrastructureReg  RoleQuery = "userInfrastructureReg"
	CreateChaosWorkFlow    RoleQuery = "CreateChaosWorkFlow"
	ReRunChaosWorkFlow     RoleQuery = "ReRunChaosWorkFlow"
	DeleteChaosWorkflow    RoleQuery = "DeleteChaosWorkflow"
	AddChaosHub            RoleQuery = "AddChaosHub"
	UpdateChaosWorkflow    RoleQuery = "UpdateChaosWorkflow"
	DeleteInfrastructures  RoleQuery = "DeleteInfrastructures"
	UpdateChaosHub         RoleQuery = "UpdateChaosHub"
	DeleteChaosHub         RoleQuery = "DeleteChaosHub"
	EnableGitOps           RoleQuery = "EnableGitOps"
	DisableGitOps          RoleQuery = "DisableGitOps"
	UpdateGitOps           RoleQuery = "UpdateGitOps"
	ListWorkflowRuns       RoleQuery = "ListWorkflowRuns"
	GetWorkflowRun         RoleQuery = "GetWorkflowRun"
	ListInfrastructures    RoleQuery = "ListInfrastructures"
	GetInfrastructure      RoleQuery = "GetInfrastructure "
	GetManifest            RoleQuery = "GetManifest"
	GetInfraDetails        RoleQuery = "GetInfraDetails"
	ListCharts             RoleQuery = "ListCharts"
	ListWorkflow           RoleQuery = "ListWorkflow"
	SaveChaosHub           RoleQuery = "SaveChaosHub"
	CreateImageRegistry    RoleQuery = "CreateImageRegistry"
	UpdateImageRegistry    RoleQuery = "UpdateImageRegistry"
	DeleteImageRegistry    RoleQuery = "DeleteImageRegistry"
	GetGitOpsDetails       RoleQuery = "GetGitOpsDetails"
	ListImageRegistry      RoleQuery = "ListImageRegistry"
	GetImageRegistry       RoleQuery = "GetImageRegistry"
	CreateEnvironment      RoleQuery = "CreateEnvironment"
	UpdateEnvironment      RoleQuery = "UpdateEnvironment"
	DeleteEnvironment      RoleQuery = "DeleteEnvironment"
	GetEnvironment         RoleQuery = "GetEnvironment"
	ListEnvironments       RoleQuery = "ListEnvironments"
	MemberRoleOwnerString            = string(model.MemberRoleOwner)
	MemberRoleEditorString           = string(model.MemberRoleEditor)
	MemberRoleViewerString           = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserInfrastructureReg: {MemberRoleOwnerString, MemberRoleEditorString},
	CreateChaosWorkFlow:   {MemberRoleOwnerString, MemberRoleEditorString},
	ReRunChaosWorkFlow:    {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosWorkflow:   {MemberRoleOwnerString, MemberRoleEditorString},
	AddChaosHub:           {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosWorkflow:   {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteInfrastructures: {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	EnableGitOps:          {MemberRoleOwnerString},
	DisableGitOps:         {MemberRoleOwnerString},
	UpdateGitOps:          {MemberRoleOwnerString},
	ListWorkflowRuns:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowRun:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListInfrastructures: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetInfrastructure: {MemberRoleOwnerString, MemberRoleEditorString,
		MemberRoleViewerString},
	GetManifest:         {MemberRoleOwnerString, MemberRoleEditorString},
	GetInfraDetails:     {MemberRoleOwnerString, MemberRoleEditorString},
	ListCharts:          {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListWorkflow:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	SaveChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	CreateImageRegistry: {MemberRoleOwnerString},
	UpdateImageRegistry: {MemberRoleOwnerString},
	DeleteImageRegistry: {MemberRoleOwnerString},
	GetGitOpsDetails:    {MemberRoleOwnerString},
	ListImageRegistry:   {MemberRoleOwnerString},
	GetImageRegistry:    {MemberRoleOwnerString},
	CreateEnvironment:   {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateEnvironment:   {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteEnvironment:   {MemberRoleOwnerString, MemberRoleEditorString},
	GetEnvironment:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListEnvironments:    {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
}
