// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

type ActionPayload struct {
	RequestType  *string `json:"request_type"`
	K8sManifest  *string `json:"k8s_manifest"`
	Namespace    *string `json:"namespace"`
	ExternalData *string `json:"external_data"`
}

type Annotation struct {
	Categories       string `json:"Categories"`
	Vendor           string `json:"Vendor"`
	CreatedAt        string `json:"CreatedAt"`
	Repository       string `json:"Repository"`
	Support          string `json:"Support"`
	ChartDescription string `json:"ChartDescription"`
}

type ChaosWorkFlowInput struct {
	WorkflowManifest    string             `json:"workflow_manifest"`
	CronSyntax          string             `json:"cronSyntax"`
	WorkflowName        string             `json:"workflow_name"`
	WorkflowDescription string             `json:"workflow_description"`
	Weightages          []*WeightagesInput `json:"weightages"`
	IsCustomWorkflow    bool               `json:"isCustomWorkflow"`
	ProjectID           string             `json:"project_id"`
	ClusterID           string             `json:"cluster_id"`
}

type ChaosWorkFlowResponse struct {
	WorkflowID          string `json:"workflow_id"`
	CronSyntax          string `json:"cronSyntax"`
	WorkflowName        string `json:"workflow_name"`
	WorkflowDescription string `json:"workflow_description"`
	IsCustomWorkflow    bool   `json:"isCustomWorkflow"`
}

type Chart struct {
	APIVersion  string              `json:"ApiVersion"`
	Kind        string              `json:"Kind"`
	Metadata    *Metadata           `json:"Metadata"`
	Spec        *Spec               `json:"Spec"`
	PackageInfo *PackageInformation `json:"PackageInfo"`
	Experiments []*Chart            `json:"Experiments"`
}

type Charts struct {
	Charts []*Chart `json:"Charts"`
}

type ChartsInput struct {
	HubName    string `json:"HubName"`
	UserName   string `json:"UserName"`
	RepoBranch string `json:"RepoBranch"`
	RepoURL    string `json:"RepoURL"`
}

type Cluster struct {
	ClusterID          string  `json:"cluster_id"`
	ProjectID          string  `json:"project_id"`
	ClusterName        string  `json:"cluster_name"`
	Description        *string `json:"description"`
	PlatformName       string  `json:"platform_name"`
	AccessKey          string  `json:"access_key"`
	IsRegistered       bool    `json:"is_registered"`
	IsClusterConfirmed bool    `json:"is_cluster_confirmed"`
	IsActive           bool    `json:"is_active"`
	UpdatedAt          string  `json:"updated_at"`
	CreatedAt          string  `json:"created_at"`
	ClusterType        string  `json:"cluster_type"`
	NoOfSchedules      *int    `json:"no_of_schedules"`
	NoOfWorkflows      *int    `json:"no_of_workflows"`
	Token              string  `json:"token"`
	AgentNamespace     *string `json:"agent_namespace"`
	Serviceaccount     *string `json:"serviceaccount"`
	AgentScope         string  `json:"agent_scope"`
	AgentNsExists      *bool   `json:"agent_ns_exists"`
	AgentSaExists      *bool   `json:"agent_sa_exists"`
}

type ClusterAction struct {
	ProjectID string         `json:"project_id"`
	Action    *ActionPayload `json:"action"`
}

type ClusterActionInput struct {
	ClusterID string `json:"cluster_id"`
	Action    string `json:"action"`
}

type ClusterConfirmResponse struct {
	IsClusterConfirmed bool    `json:"isClusterConfirmed"`
	NewClusterKey      *string `json:"newClusterKey"`
	ClusterID          *string `json:"cluster_id"`
}

type ClusterEvent struct {
	EventID     string   `json:"event_id"`
	EventType   string   `json:"event_type"`
	EventName   string   `json:"event_name"`
	Description string   `json:"description"`
	Cluster     *Cluster `json:"cluster"`
}

type ClusterEventInput struct {
	EventName   string `json:"event_name"`
	Description string `json:"description"`
	ClusterID   string `json:"cluster_id"`
	AccessKey   string `json:"access_key"`
}

type ClusterIdentity struct {
	ClusterID string `json:"cluster_id"`
	AccessKey string `json:"access_key"`
}

type ClusterInput struct {
	ClusterName    string  `json:"cluster_name"`
	Description    *string `json:"description"`
	PlatformName   string  `json:"platform_name"`
	ProjectID      string  `json:"project_id"`
	ClusterType    string  `json:"cluster_type"`
	AgentNamespace *string `json:"agent_namespace"`
	Serviceaccount *string `json:"serviceaccount"`
	AgentScope     string  `json:"agent_scope"`
	AgentNsExists  *bool   `json:"agent_ns_exists"`
	AgentSaExists  *bool   `json:"agent_sa_exists"`
}

type CreateMyHub struct {
	HubName    string `json:"HubName"`
	RepoURL    string `json:"RepoURL"`
	RepoBranch string `json:"RepoBranch"`
}

type CreateUserInput struct {
	Username    string  `json:"username"`
	Email       *string `json:"email"`
	CompanyName *string `json:"company_name"`
	Name        *string `json:"name"`
	ProjectName string  `json:"project_name"`
}

type ExperimentInput struct {
	UserName       string  `json:"UserName"`
	ChartName      string  `json:"ChartName"`
	ExperimentName string  `json:"ExperimentName"`
	HubName        string  `json:"HubName"`
	FileType       *string `json:"FileType"`
}

type Experiments struct {
	Name string `json:"Name"`
	Csv  string `json:"CSV"`
	Desc string `json:"Desc"`
}

type Link struct {
	Name string `json:"Name"`
	URL  string `json:"Url"`
}

type Maintainer struct {
	Name  string `json:"Name"`
	Email string `json:"Email"`
}

type Member struct {
	UserID     string     `json:"user_id"`
	UserName   string     `json:"user_name"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Role       MemberRole `json:"role"`
	Invitation string     `json:"invitation"`
	JoinedAt   string     `json:"joined_at"`
}

type MemberInput struct {
	ProjectID string      `json:"project_id"`
	UserName  string      `json:"user_name"`
	Role      *MemberRole `json:"role"`
}

type Metadata struct {
	Name        string      `json:"Name"`
	Version     string      `json:"Version"`
	Annotations *Annotation `json:"Annotations"`
}

type MyHub struct {
	ID          string `json:"id"`
	RepoURL     string `json:"RepoURL"`
	RepoBranch  string `json:"RepoBranch"`
	IsConfirmed bool   `json:"IsConfirmed"`
	HubName     string `json:"HubName"`
}

type MyHubStatus struct {
	ID          string `json:"id"`
	RepoURL     string `json:"RepoURL"`
	RepoBranch  string `json:"RepoBranch"`
	IsAvailable bool   `json:"IsAvailable"`
	TotalExp    string `json:"TotalExp"`
	HubName     string `json:"HubName"`
}

type PackageInformation struct {
	PackageName string         `json:"PackageName"`
	Experiments []*Experiments `json:"Experiments"`
}

type PodLog struct {
	ClusterID     *ClusterIdentity `json:"cluster_id"`
	RequestID     string           `json:"request_id"`
	WorkflowRunID string           `json:"workflow_run_id"`
	PodName       string           `json:"pod_name"`
	PodType       string           `json:"pod_type"`
	Log           string           `json:"log"`
}

type PodLogRequest struct {
	ClusterID      string  `json:"cluster_id"`
	WorkflowRunID  string  `json:"workflow_run_id"`
	PodName        string  `json:"pod_name"`
	PodNamespace   string  `json:"pod_namespace"`
	PodType        string  `json:"pod_type"`
	ExpPod         *string `json:"exp_pod"`
	RunnerPod      *string `json:"runner_pod"`
	ChaosNamespace *string `json:"chaos_namespace"`
}

type PodLogResponse struct {
	WorkflowRunID string `json:"workflow_run_id"`
	PodName       string `json:"pod_name"`
	PodType       string `json:"pod_type"`
	Log           string `json:"log"`
}

type Project struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Members   []*Member `json:"members"`
	State     *string   `json:"state"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
	RemovedAt string    `json:"removed_at"`
}

type Provider struct {
	Name string `json:"Name"`
}

type ScheduledWorkflows struct {
	WorkflowID          string        `json:"workflow_id"`
	WorkflowManifest    string        `json:"workflow_manifest"`
	CronSyntax          string        `json:"cronSyntax"`
	ClusterName         string        `json:"cluster_name"`
	WorkflowName        string        `json:"workflow_name"`
	WorkflowDescription string        `json:"workflow_description"`
	Weightages          []*Weightages `json:"weightages"`
	IsCustomWorkflow    bool          `json:"isCustomWorkflow"`
	UpdatedAt           string        `json:"updated_at"`
	CreatedAt           string        `json:"created_at"`
	ProjectID           string        `json:"project_id"`
	ClusterID           string        `json:"cluster_id"`
	ClusterType         string        `json:"cluster_type"`
}

type Spec struct {
	DisplayName         string        `json:"DisplayName"`
	CategoryDescription string        `json:"CategoryDescription"`
	Keywords            []string      `json:"Keywords"`
	Maturity            string        `json:"Maturity"`
	Maintainers         []*Maintainer `json:"Maintainers"`
	MinKubeVersion      string        `json:"MinKubeVersion"`
	Provider            string        `json:"Provider"`
	Links               []*Link       `json:"Links"`
	Experiments         []string      `json:"Experiments"`
	ChaosExpCRDLink     string        `json:"ChaosExpCRDLink"`
	Platforms           []string      `json:"Platforms"`
	ChaosType           *string       `json:"ChaosType"`
}

type UpdateUserInput struct {
	ID          string  `json:"id"`
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	CompanyName *string `json:"company_name"`
}

type User struct {
	ID              string     `json:"id"`
	Username        string     `json:"username"`
	Email           *string    `json:"email"`
	IsEmailVerified *bool      `json:"is_email_verified"`
	MyHub           []*MyHub   `json:"my_hub"`
	CompanyName     *string    `json:"company_name"`
	Name            *string    `json:"name"`
	Projects        []*Project `json:"projects"`
	Role            *string    `json:"role"`
	State           *string    `json:"state"`
	CreatedAt       string     `json:"created_at"`
	UpdatedAt       string     `json:"updated_at"`
	RemovedAt       string     `json:"removed_at"`
}

type WeightagesInput struct {
	ExperimentName string `json:"experiment_name"`
	Weightage      int    `json:"weightage"`
}

type Workflow struct {
	WorkflowID          string          `json:"workflow_id"`
	WorkflowManifest    string          `json:"workflow_manifest"`
	CronSyntax          string          `json:"cronSyntax"`
	ClusterName         string          `json:"cluster_name"`
	WorkflowName        string          `json:"workflow_name"`
	WorkflowDescription string          `json:"workflow_description"`
	Weightages          []*Weightages   `json:"weightages"`
	IsCustomWorkflow    bool            `json:"isCustomWorkflow"`
	UpdatedAt           string          `json:"updated_at"`
	CreatedAt           string          `json:"created_at"`
	ProjectID           string          `json:"project_id"`
	ClusterID           string          `json:"cluster_id"`
	ClusterType         string          `json:"cluster_type"`
	WorkflowRuns        []*WorkflowRuns `json:"workflow_runs"`
}

type WorkflowRun struct {
	WorkflowRunID string  `json:"workflow_run_id"`
	WorkflowID    string  `json:"workflow_id"`
	ClusterName   string  `json:"cluster_name"`
	LastUpdated   string  `json:"last_updated"`
	ProjectID     string  `json:"project_id"`
	ClusterID     string  `json:"cluster_id"`
	WorkflowName  string  `json:"workflow_name"`
	ClusterType   *string `json:"cluster_type"`
	ExecutionData string  `json:"execution_data"`
}

type WorkflowRunInput struct {
	WorkflowID    string           `json:"workflow_id"`
	WorkflowRunID string           `json:"workflow_run_id"`
	WorkflowName  string           `json:"workflow_name"`
	ExecutionData string           `json:"execution_data"`
	ClusterID     *ClusterIdentity `json:"cluster_id"`
	Completed     bool             `json:"completed"`
}

type WorkflowRuns struct {
	ExecutionData string `json:"execution_data"`
	WorkflowRunID string `json:"workflow_run_id"`
	LastUpdated   string `json:"last_updated"`
}

type ClusterRegResponse struct {
	Token       string `json:"token"`
	ClusterID   string `json:"cluster_id"`
	ClusterName string `json:"cluster_name"`
}

type Weightages struct {
	ExperimentName string `json:"experiment_name"`
	Weightage      int    `json:"weightage"`
}

type MemberRole string

const (
	MemberRoleOwner  MemberRole = "Owner"
	MemberRoleEditor MemberRole = "Editor"
	MemberRoleViewer MemberRole = "Viewer"
)

var AllMemberRole = []MemberRole{
	MemberRoleOwner,
	MemberRoleEditor,
	MemberRoleViewer,
}

func (e MemberRole) IsValid() bool {
	switch e {
	case MemberRoleOwner, MemberRoleEditor, MemberRoleViewer:
		return true
	}
	return false
}

func (e MemberRole) String() string {
	return string(e)
}

func (e *MemberRole) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = MemberRole(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid MemberRole", str)
	}
	return nil
}

func (e MemberRole) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
