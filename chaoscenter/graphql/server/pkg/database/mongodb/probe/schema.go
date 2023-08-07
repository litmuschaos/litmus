package probe

import (
	"encoding/json"
	"strconv"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
)

type ProbeType string

type Probe struct {
	ProjectID                string `bson:"project_id"`
	mongodb.ResourceDetails  `bson:",inline"`
	mongodb.Audit            `bson:",inline"`
	Type                     ProbeType                      `bson:"type"`
	HTTPProperties           *HTTPProbe                     `bson:"http_properties,omitempty"`
	CMDProperties            *CMDProbe                      `bson:"cmd_properties,omitempty"`
	PROMProperties           *PROMProbe                     `bson:"prom_properties,omitempty"`
	K8SProperties            *K8SProbe                      `bson:"k8s_properties,omitempty"`
	RecentExecutions         []*model.ProbeRecentExecutions `bson:"recent_executions"`
	AverageSuccessPercentage float64                        `bson:"average_success_percentage"`
}

type ProbeResponseDetails struct {
	FaultName string `bson:"fault_name"`
}

type Probes struct {
	FaultName string `bson:"fault_name"`
}

type ExecutionHistory struct {
	ExperimentID   string                    `bson:"experiment_id"`
	ExperimentName string                    `bson:"experiment_name"`
	UpdatedBy      string                    `bson:"updated_by"`
	ExecutionData  string                    `bson:"execution_data"`
	UpdatedAt      int                       `bson:"updated_at"`
	Probes         []Probes                  `bson:"probes"`
	Phase          model.ExperimentRunStatus `bson:"phase"`
}

type ProbeWithExecutionHistory struct {
	ProjectID                string `bson:"project_id"`
	mongodb.ResourceDetails  `bson:",inline"`
	mongodb.Audit            `bson:",inline"`
	Type                     ProbeType          `bson:"type"`
	HTTPProperties           *HTTPProbe         `bson:"http_properties,omitempty"`
	CMDProperties            *CMDProbe          `bson:"cmd_properties,omitempty"`
	PROMProperties           *PROMProbe         `bson:"prom_properties,omitempty"`
	K8SProperties            *K8SProbe          `bson:"k8s_properties,omitempty"`
	AverageSuccessPercentage float64            `bson:"average_success_percentage"`
	ExecutionHistory         []ExecutionHistory `bson:"execution_history"`
}

type CommonProbeProperties struct {
	ProbeTimeout      string  `bson:"probe_timeout"`
	Interval          string  `bson:"interval"`
	PollingInterval   *string `bson:"polling_interval,omitempty"`
	InitialDelay      *string `bson:"initial_delay,omitempty"`
	EvaluationTimeout *string `bson:"evaluation_timeout,omitempty"`
	Retry             *int    `bson:"retry,omitempty"`
	Attempt           *int    `bson:"attempt,omitempty"`
	StopOnFailure     *bool   `bson:"stop_on_failure,omitempty"`
}

type HTTPProbe struct {
	URL                string  `bson:"url"`
	ProbeTimeout       string  `bson:"probe_timeout"`
	Interval           string  `bson:"interval"`
	EvaluationTimeout  *string `bson:"evaluation_timeout,omitempty"`
	PollingInterval    *string `bson:"polling_interval,omitempty"`
	InitialDelay       *string `bson:"initial_delay,omitempty"`
	Retry              *int    `bson:"retry,omitempty"`
	Attempt            *int    `bson:"attempt,omitempty"`
	Method             Method  `bson:"method"`
	StopOnFailure      *bool   `bson:"stop_on_failure,omitempty"`
	InsecureSkipVerify *bool   `bson:"insecure_skip_verify,omitempty"`
}

type PROMProbe struct {
	Endpoint          string     `bson:"endpoint"`
	Query             string     `bson:"query"`
	EvaluationTimeout *string    `bson:"evaluation_timeout,omitempty"`
	PollingInterval   *string    `bson:"polling_interval"`
	InitialDelay      *string    `bson:"initial_delay,omitempty"`
	QueryPath         *string    `bson:"query_path,omitempty"`
	ProbeTimeout      string     `bson:"probe_timeout"`
	Interval          string     `bson:"interval"`
	Retry             *int       `bson:"retry,omitempty"`
	Attempt           *int       `bson:"attempt,omitempty"`
	Comparator        Comparator `bson:"comparator"`
	StopOnFailure     *bool      `bson:"stop_on_failure,omitempty"`
}

type CMDProbe struct {
	Command           string                  `bson:"command"`
	ProbeTimeout      string                  `bson:"probe_timeout"`
	Interval          string                  `bson:"interval"`
	EvaluationTimeout *string                 `bson:"evaluation_timeout,omitempty"`
	PollingInterval   *string                 `bson:"polling_interval,omitempty"`
	InitialDelay      *string                 `bson:"initial_delay,omitempty"`
	Retry             *int                    `bson:"retry,omitempty"`
	Attempt           *int                    `bson:"attempt,omitempty"`
	Comparator        Comparator              `bson:"comparator"`
	Source            *v1alpha1.SourceDetails `bson:"source,omitempty"`
	StopOnFailure     *bool                   `bson:"stop_on_failure,omitempty"`
}

type K8SProbe struct {
	Group             *string `bson:"group,omitempty"`
	Version           string  `bson:"version"`
	Resource          string  `bson:"resource"`
	ResourceNames     *string `bson:"resourceNames,omitempty"`
	Namespace         *string `bson:"namespace,omitempty"`
	FieldSelector     *string `bson:"field_selector,omitempty"`
	LabelSelector     *string `bson:"label_selector,omitempty"`
	Operation         string  `bson:"operation"`
	ProbeTimeout      string  `bson:"probe_timeout"`
	Interval          string  `bson:"interval"`
	InitialDelay      *string `bson:"initial_delay,omitempty"`
	PollingInterval   *string `bson:"polling_interval,omitempty"`
	EvaluationTimeout *string `bson:"evaluation_timeout,omitempty"`
	Retry             *int    `bson:"retry,omitempty"`
	Attempt           *int    `bson:"attempt,omitempty"`
	StopOnFailure     *bool   `bson:"stop_on_failure,omitempty"`
}

type GET struct {
	Criteria     string `bson:"criteria"`
	ResponseCode string `bson:"response_code"`
}

type POST struct {
	ContentType  *string `bson:"content_type,omitempty"`
	Body         *string `bson:"body,omitempty"`
	BodyPath     *string `bson:"body_path, omitempty"`
	Criteria     string  `bson:"criteria"`
	ResponseCode string  `bson:"response_code"`
}

type Method struct {
	GET  *GET  `bson:"get,omitempty"`
	POST *POST `bson:"post,omitempty"`
}

type Comparator struct {
	Type     string `bson:"type"`
	Value    string `bson:"value"`
	Criteria string `bson:"criteria"`
}

// GetOutputProbe
func (probe *Probe) GetOutputProbe() *model.Probe {
	probeResponse := &model.Probe{
		ProjectID:        probe.ProjectID,
		Name:             probe.Name,
		Description:      &probe.Description,
		Tags:             probe.Tags,
		RecentExecutions: probe.RecentExecutions,
		CreatedAt:        strconv.Itoa(int(probe.CreatedAt)),
		UpdatedAt:        strconv.Itoa(int(probe.UpdatedAt)),
		Type:             model.ProbeType(probe.Type),
		CreatedBy: &model.UserDetails{
			UserID: probe.CreatedBy,
		},
		UpdatedBy: &model.UserDetails{
			UserID: probe.UpdatedBy,
		},
	}

	if model.ProbeType(probe.Type) == model.ProbeTypeHTTPProbe {
		probeResponse.HTTPProperties = &model.HTTPProbe{
			ProbeTimeout:         probe.HTTPProperties.ProbeTimeout,
			Interval:             probe.HTTPProperties.Interval,
			Attempt:              probe.HTTPProperties.Attempt,
			Retry:                probe.HTTPProperties.Retry,
			ProbePollingInterval: probe.HTTPProperties.PollingInterval,
			InitialDelay:         probe.HTTPProperties.InitialDelay,
			EvaluationTimeout:    probe.HTTPProperties.EvaluationTimeout,
			StopOnFailure:        probe.HTTPProperties.StopOnFailure,
			URL:                  probe.HTTPProperties.URL,
			Method:               &model.Method{},
		}

		if probeResponse.HTTPProperties.InsecureSkipVerify != nil {
			probeResponse.HTTPProperties.InsecureSkipVerify = probe.HTTPProperties.InsecureSkipVerify
		}

		if probe.HTTPProperties.Method.GET != nil {
			probeResponse.HTTPProperties.Method.Get = &model.Get{
				Criteria:     probe.HTTPProperties.Method.GET.Criteria,
				ResponseCode: probe.HTTPProperties.Method.GET.ResponseCode,
			}
		} else if probe.HTTPProperties.Method.POST != nil {
			probeResponse.HTTPProperties.Method.Post = &model.Post{
				Criteria:     probe.HTTPProperties.Method.POST.Criteria,
				ResponseCode: probe.HTTPProperties.Method.POST.ResponseCode,
			}

			if probeResponse.HTTPProperties.Method.Post.ContentType != nil {
				probeResponse.HTTPProperties.Method.Post.ContentType = probe.HTTPProperties.Method.POST.ContentType
			}

			if probeResponse.HTTPProperties.Method.Post.Body != nil {
				probeResponse.HTTPProperties.Method.Post.Body = probe.HTTPProperties.Method.POST.Body
			}

			if probeResponse.HTTPProperties.Method.Post.BodyPath != nil {
				probeResponse.HTTPProperties.Method.Post.BodyPath = probe.HTTPProperties.Method.POST.BodyPath
			}
		}
	} else if model.ProbeType(probe.Type) == model.ProbeTypeCmdProbe {
		probeResponse.CmdProperties = &model.CMDProbe{
			ProbeTimeout:         probe.CMDProperties.ProbeTimeout,
			Interval:             probe.CMDProperties.Interval,
			Attempt:              probe.CMDProperties.Attempt,
			Retry:                probe.CMDProperties.Retry,
			ProbePollingInterval: probe.CMDProperties.PollingInterval,
			InitialDelay:         probe.CMDProperties.InitialDelay,
			EvaluationTimeout:    probe.CMDProperties.EvaluationTimeout,
			StopOnFailure:        probe.CMDProperties.StopOnFailure,
			Command:              probe.CMDProperties.Command,
			Comparator: &model.Comparator{
				Type:     probe.CMDProperties.Comparator.Type,
				Value:    probe.CMDProperties.Comparator.Value,
				Criteria: probe.CMDProperties.Comparator.Criteria,
			},
		}

		// CMD Probe -> Source
		if probe.CMDProperties.Source != nil {
			jsonSource, _ := json.Marshal(probe.CMDProperties.Source)
			source := string(jsonSource)
			probeResponse.CmdProperties.Source = &source
		}

	} else if model.ProbeType(probe.Type) == model.ProbeTypePromProbe {
		probeResponse.PromProperties = &model.PROMProbe{
			ProbeTimeout:         probe.PROMProperties.ProbeTimeout,
			Interval:             probe.PROMProperties.Interval,
			Attempt:              probe.PROMProperties.Attempt,
			Retry:                probe.PROMProperties.Retry,
			ProbePollingInterval: probe.PROMProperties.PollingInterval,
			InitialDelay:         probe.PROMProperties.InitialDelay,
			EvaluationTimeout:    probe.PROMProperties.EvaluationTimeout,
			StopOnFailure:        probe.PROMProperties.StopOnFailure,
			Endpoint:             probe.PROMProperties.Endpoint,
			Query:                &probe.PROMProperties.Query,
			QueryPath:            probe.PROMProperties.QueryPath,
			Comparator: &model.Comparator{
				Type:     probe.PROMProperties.Comparator.Type,
				Value:    probe.PROMProperties.Comparator.Value,
				Criteria: probe.PROMProperties.Comparator.Criteria,
			},
		}
	} else if model.ProbeType(probe.Type) == model.ProbeTypeK8sProbe {
		probeResponse.K8sProperties = &model.K8SProbe{
			ProbeTimeout:         probe.K8SProperties.ProbeTimeout,
			Interval:             probe.K8SProperties.Interval,
			Attempt:              probe.K8SProperties.Attempt,
			Retry:                probe.K8SProperties.Retry,
			ProbePollingInterval: probe.K8SProperties.PollingInterval,
			InitialDelay:         probe.K8SProperties.InitialDelay,
			EvaluationTimeout:    probe.K8SProperties.EvaluationTimeout,
			StopOnFailure:        probe.K8SProperties.StopOnFailure,
			Group:                probe.K8SProperties.Group,
			Version:              probe.K8SProperties.Version,
			Resource:             probe.K8SProperties.Resource,
			Namespace:            probe.K8SProperties.Namespace,
			FieldSelector:        probe.K8SProperties.FieldSelector,
			LabelSelector:        probe.K8SProperties.LabelSelector,
			Operation:            probe.K8SProperties.Operation,
		}
	}

	return probeResponse
}
