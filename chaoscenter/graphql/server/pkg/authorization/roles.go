package authorization

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// RoleQuery states the query for the roles
type RoleQuery string

const (
	// Chaos_Infrastructure
	UserInfrastructureReg RoleQuery = "userInfrastructureReg"
	ListInfrastructures   RoleQuery = "ListInfrastructures"
	GetInfrastructure     RoleQuery = "GetInfrastructure "
	DeleteInfrastructures RoleQuery = "DeleteInfrastructures"
	GetManifest           RoleQuery = "GetManifest"
	GetInfraDetails       RoleQuery = "GetInfraDetails"

	// Chaos_Experiment
	CreateChaosExperiment RoleQuery = "CreateChaosExperiment"
	ReRunChaosExperiment  RoleQuery = "ReRunChaosExperiment"
	DeleteChaosExperiment RoleQuery = "DeleteChaosEnvironment"
	UpdateChaosExperiment RoleQuery = "UpdateChaosExperiment"
	ListExperiment        RoleQuery = "ListExperiment"
	CreateEnvironment     RoleQuery = "CreateEnvironment"

	// Chaos_Experiment_run
	StopChaosExperiment RoleQuery = "StopChaosExperiment"
	ListWorkflowRuns    RoleQuery = "ListWorkflowRuns"
	GetWorkflowRun      RoleQuery = "GetWorkflowRun"

	// ChaosHub
	AddChaosHub    RoleQuery = "AddChaosHub"
	UpdateChaosHub RoleQuery = "UpdateChaosHub"
	DeleteChaosHub RoleQuery = "DeleteChaosHub"
	ListCharts     RoleQuery = "ListCharts"
	SaveChaosHub   RoleQuery = "SaveChaosHub"

	// GitOps
	EnableGitOps     RoleQuery = "EnableGitOps"
	DisableGitOps    RoleQuery = "DisableGitOps"
	UpdateGitOps     RoleQuery = "UpdateGitOps"
	GetGitOpsDetails RoleQuery = "GetGitOpsDetails"

	// Image_Registry
	CreateImageRegistry RoleQuery = "CreateImageRegistry"
	UpdateImageRegistry RoleQuery = "UpdateImageRegistry"
	DeleteImageRegistry RoleQuery = "DeleteImageRegistry"
	ListImageRegistry   RoleQuery = "ListImageRegistry"
	GetImageRegistry    RoleQuery = "GetImageRegistry"

	// Environment
	UpdateEnvironment RoleQuery = "UpdateEnvironment"
	DeleteEnvironment RoleQuery = "DeleteEnvironment"
	GetEnvironment    RoleQuery = "GetEnvironment"
	ListEnvironments  RoleQuery = "ListEnvironments"

	// Probe
	AddProbe                 RoleQuery = "AddProbe"
	DeleteProbe              RoleQuery = "DeleteProbe"
	UpdateProbe              RoleQuery = "UpdateProbe"
	GetProbe                 RoleQuery = "GetProbe"
	ListProbes               RoleQuery = "ListProbes"
	MemberRoleOwnerString              = string(model.MemberRoleOwner)
	MemberRoleExecutorString           = string(model.MemberRoleExecutor)
	MemberRoleViewerString             = string(model.MemberRoleViewer)
	MemberRoleEditorString             = string(model.MemberRoleEditor)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserInfrastructureReg: {MemberRoleOwnerString},
	CreateChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	ReRunChaosExperiment:  {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleEditorString},
	DeleteChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	StopChaosExperiment:   {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleEditorString},
	AddChaosHub:           {MemberRoleOwnerString},
	UpdateChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteInfrastructures: {MemberRoleOwnerString},
	UpdateChaosHub:        {MemberRoleOwnerString},
	DeleteChaosHub:        {MemberRoleOwnerString},
	EnableGitOps:          {MemberRoleOwnerString},
	DisableGitOps:         {MemberRoleOwnerString},
	UpdateGitOps:          {MemberRoleOwnerString},
	ListWorkflowRuns:      {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	GetWorkflowRun:        {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	ListInfrastructures:   {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	GetInfrastructure:     {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	GetManifest:           {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleEditorString},
	GetInfraDetails:       {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleEditorString},
	ListCharts:            {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	ListExperiment:        {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	SaveChaosHub:          {MemberRoleOwnerString},
	CreateImageRegistry:   {MemberRoleOwnerString},
	UpdateImageRegistry:   {MemberRoleOwnerString},
	DeleteImageRegistry:   {MemberRoleOwnerString},
	GetGitOpsDetails:      {MemberRoleOwnerString},
	ListImageRegistry:     {MemberRoleOwnerString},
	GetImageRegistry:      {MemberRoleOwnerString},
	CreateEnvironment:     {MemberRoleOwnerString},
	UpdateEnvironment:     {MemberRoleOwnerString},
	DeleteEnvironment:     {MemberRoleOwnerString},
	GetEnvironment:        {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString},
	ListEnvironments:      {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString},
	AddProbe:              {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateProbe:           {MemberRoleOwnerString, MemberRoleEditorString},
	GetProbe:              {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	ListProbes:            {MemberRoleOwnerString, MemberRoleExecutorString, MemberRoleViewerString, MemberRoleEditorString},
	DeleteProbe:           {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleEditorString},
}
