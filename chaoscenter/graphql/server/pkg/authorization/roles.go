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
	AddProbe               RoleQuery = "AddProbe"
	DeleteProbe            RoleQuery = "DeleteProbe"
	UpdateProbe            RoleQuery = "UpdateProbe"
	GetProbe               RoleQuery = "GetProbe"
	ListProbes             RoleQuery = "ListProbes"
	MemberRoleOwnerString            = string(model.MemberRoleOwner)
	MemberRoleEditorString           = string(model.MemberRoleEditor)
	MemberRoleViewerString           = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserInfrastructureReg: {MemberRoleOwnerString, MemberRoleEditorString},
	CreateChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	ReRunChaosExperiment:  {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	StopChaosExperiment:   {MemberRoleOwnerString, MemberRoleEditorString},
	AddChaosHub:           {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosExperiment: {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteInfrastructures: {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteChaosHub:        {MemberRoleOwnerString, MemberRoleEditorString},
	EnableGitOps:          {MemberRoleOwnerString},
	DisableGitOps:         {MemberRoleOwnerString},
	UpdateGitOps:          {MemberRoleOwnerString},
	ListWorkflowRuns:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetWorkflowRun:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListInfrastructures:   {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetInfrastructure:     {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	GetManifest:           {MemberRoleOwnerString, MemberRoleEditorString},
	GetInfraDetails:       {MemberRoleOwnerString, MemberRoleEditorString},
	ListCharts:            {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListExperiment:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	SaveChaosHub:          {MemberRoleOwnerString, MemberRoleEditorString},
	CreateImageRegistry:   {MemberRoleOwnerString},
	UpdateImageRegistry:   {MemberRoleOwnerString},
	DeleteImageRegistry:   {MemberRoleOwnerString},
	GetGitOpsDetails:      {MemberRoleOwnerString},
	ListImageRegistry:     {MemberRoleOwnerString},
	GetImageRegistry:      {MemberRoleOwnerString},
	CreateEnvironment:     {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateEnvironment:     {MemberRoleOwnerString, MemberRoleEditorString},
	DeleteEnvironment:     {MemberRoleOwnerString, MemberRoleEditorString},
	GetEnvironment:        {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListEnvironments:      {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	AddProbe:              {MemberRoleOwnerString, MemberRoleEditorString},
	UpdateProbe:           {MemberRoleOwnerString, MemberRoleEditorString},
	GetProbe:              {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	ListProbes:            {MemberRoleOwnerString, MemberRoleEditorString, MemberRoleViewerString},
	DeleteProbe:           {MemberRoleOwnerString, MemberRoleEditorString},
}
