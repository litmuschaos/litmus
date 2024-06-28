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
	MemberRoleExecuterString           = string(model.MemberRoleExecuter)
	MemberRoleViewerString           = string(model.MemberRoleViewer)
)

var MutationRbacRules = map[RoleQuery][]string{
	UserInfrastructureReg: {MemberRoleOwnerString, MemberRoleExecuterString},
	CreateChaosExperiment: {MemberRoleOwnerString},
	ReRunChaosExperiment:  {MemberRoleOwnerString, MemberRoleExecuterString},
	DeleteChaosExperiment: {MemberRoleOwnerString, MemberRoleExecuterString},
	StopChaosExperiment:   {MemberRoleOwnerString, MemberRoleExecuterString},
	AddChaosHub:           {MemberRoleOwnerString, MemberRoleExecuterString},
	UpdateChaosExperiment: {MemberRoleOwnerString, MemberRoleExecuterString},
	DeleteInfrastructures: {MemberRoleOwnerString, MemberRoleExecuterString},
	UpdateChaosHub:        {MemberRoleOwnerString, MemberRoleExecuterString},
	DeleteChaosHub:        {MemberRoleOwnerString, MemberRoleExecuterString},
	EnableGitOps:          {MemberRoleOwnerString},
	DisableGitOps:         {MemberRoleOwnerString},
	UpdateGitOps:          {MemberRoleOwnerString},
	ListWorkflowRuns:      {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	GetWorkflowRun:        {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	ListInfrastructures:   {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	GetInfrastructure:     {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	GetManifest:           {MemberRoleOwnerString, MemberRoleExecuterString},
	GetInfraDetails:       {MemberRoleOwnerString, MemberRoleExecuterString},
	ListCharts:            {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	ListExperiment:        {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	SaveChaosHub:          {MemberRoleOwnerString, MemberRoleExecuterString},
	CreateImageRegistry:   {MemberRoleOwnerString},
	UpdateImageRegistry:   {MemberRoleOwnerString},
	DeleteImageRegistry:   {MemberRoleOwnerString},
	GetGitOpsDetails:      {MemberRoleOwnerString},
	ListImageRegistry:     {MemberRoleOwnerString},
	GetImageRegistry:      {MemberRoleOwnerString},
	CreateEnvironment:     {MemberRoleOwnerString, MemberRoleExecuterString},
	UpdateEnvironment:     {MemberRoleOwnerString, MemberRoleExecuterString},
	DeleteEnvironment:     {MemberRoleOwnerString, MemberRoleExecuterString},
	GetEnvironment:        {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	ListEnvironments:      {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	AddProbe:              {MemberRoleOwnerString, MemberRoleExecuterString},
	UpdateProbe:           {MemberRoleOwnerString, MemberRoleExecuterString},
	GetProbe:              {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	ListProbes:            {MemberRoleOwnerString, MemberRoleExecuterString, MemberRoleViewerString},
	DeleteProbe:           {MemberRoleOwnerString, MemberRoleExecuterString},
}
