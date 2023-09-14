package probe

import (
	"context"
	"encoding/json"
	"errors"
	"sort"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"

	"github.com/ghodss/yaml"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProbeInterface interface {
	AddProbe(ctx context.Context, probe model.ProbeRequest) (*model.Probe, error)
	UpdateProbe(ctx context.Context, probe model.ProbeRequest) (string, error)
	ListProbes(ctx context.Context, probeNames []string, infrastructureType *model.InfrastructureType, filter *model.ProbeFilterInput) ([]*model.Probe, error)
	DeleteProbe(ctx context.Context, probeName string) (bool, error)
	GetProbe(ctx context.Context, probeName string) (*model.Probe, error)
	GetProbeReference(ctx context.Context, probeName string) (*model.GetProbeReferenceResponse, error)
	GetProbeYAMLData(ctx context.Context, probe model.GetProbeYAMLRequest) (string, error)
	ValidateUniqueProbe(ctx context.Context, probeName string) (bool, error)
}

type probe struct {
	ProjectID string
}

func NewProbeRepository(projectID string) ProbeInterface {
	return &probe{

		ProjectID: projectID,
	}
}

func Error(logFields logrus.Fields, message string) error {
	logrus.WithFields(logFields).Error(message)
	return errors.New(message)
}

// AddProbe - Create a new Probe
func (p *probe) AddProbe(ctx context.Context, probe model.ProbeRequest) (*model.Probe, error) {
	// TODO: Add check if probe exists

	var (
		currTime = time.Now().UnixMilli()
	)
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	logFields := logrus.Fields{

		"projectId": p.ProjectID,
		"probeName": probe.Name,
	}

	logrus.WithFields(logFields).Info("adding ", probe.Type, " probe")

	// Shared Properties

	newProbe := &dbSchemaProbe.Probe{
		ResourceDetails: mongodb.ResourceDetails{
			Name:        probe.Name,
			Description: *probe.Description,
			Tags:        probe.Tags,
		},
		ProjectID: p.ProjectID,
		Audit: mongodb.Audit{
			CreatedAt: currTime,
			UpdatedAt: currTime,
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		Type:               dbSchemaProbe.ProbeType(probe.Type),
		InfrastructureType: probe.InfrastructureType,
	}
	// Check the respective probe type and modify the property response based on the type
	if probe.Type == model.ProbeTypeHTTPProbe && probe.KubernetesHTTPProperties != nil {
		addKubernetesHTTPProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeCmdProbe && probe.KubernetesCMDProperties != nil {
		addKubernetesCMDProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypePromProbe && probe.PromProperties != nil {
		addPROMProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeK8sProbe && probe.K8sProperties != nil {
		addK8SProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeHTTPProbe && probe.KubernetesHTTPProperties == nil {
		return nil, Error(logFields, "http probe type's properties are empty")
	} else if probe.Type == model.ProbeTypeCmdProbe && probe.KubernetesCMDProperties == nil {
		return nil, Error(logFields, "cmd probe type's properties are empty")
	} else if probe.Type == model.ProbeTypePromProbe && probe.PromProperties == nil {
		return nil, Error(logFields, "prom probe type's properties are empty")
	} else if probe.Type == model.ProbeTypeK8sProbe && probe.K8sProperties == nil {
		return nil, Error(logFields, "k8s probe type's properties are empty")
	}

	// Adding the new probe into database.
	err = dbSchemaProbe.CreateProbe(ctx, *newProbe)
	if err != nil {
		return nil, err
	}

	return newProbe.GetOutputProbe(), nil
}

// UpdateProbe - Update a new Probe
func (p *probe) UpdateProbe(ctx context.Context, request model.ProbeRequest) (string, error) {
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	pr, err := dbSchemaProbe.GetProbeByName(ctx, request.Name, p.ProjectID)
	if err != nil {
		return "", err
	}

	// Shared Properties
	newProbe := &dbSchemaProbe.Probe{
		ResourceDetails: mongodb.ResourceDetails{
			Name:        request.Name,
			Description: *request.Description,
			Tags:        request.Tags,
		},
		ProjectID: p.ProjectID,
		Audit: mongodb.Audit{
			CreatedAt: pr.CreatedAt,
			UpdatedAt: time.Now().UnixMilli(),
			IsRemoved: false,
			CreatedBy: pr.CreatedBy,
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		Type:               pr.Type,
		InfrastructureType: pr.InfrastructureType,
	}

	if pr.InfrastructureType == model.InfrastructureTypeKubernetes {
		switch model.ProbeType(pr.Type) {
		case model.ProbeTypeHTTPProbe:
			addKubernetesHTTPProbeProperties(newProbe, request)
		case model.ProbeTypeCmdProbe:
			addKubernetesCMDProbeProperties(newProbe, request)
		case model.ProbeTypePromProbe:
			addPROMProbeProperties(newProbe, request)
		case model.ProbeTypeK8sProbe:
			addK8SProbeProperties(newProbe, request)
		}
	}

	if request.Type == model.ProbeTypeHTTPProbe && request.KubernetesHTTPProperties == nil {
		return "", errors.New("http probe type's properties are empty")
	} else if request.Type == model.ProbeTypeCmdProbe && request.KubernetesCMDProperties == nil {
		return "", errors.New("cmd probe type's properties are empty")
	} else if request.Type == model.ProbeTypePromProbe && request.PromProperties == nil {
		return "", errors.New("prom probe type's properties are empty")
	} else if request.Type == model.ProbeTypePromProbe && request.K8sProperties == nil {
		return "", errors.New("k8s probe type's properties are empty")
	}

	var updateQuery bson.D
	updateQuery = bson.D{
		{"$set", newProbe},
	}

	filterQuery := bson.D{
		{"name", request.Name},
		{"project_id", p.ProjectID},
		{"is_removed", false},
	}

	_, err = dbSchemaProbe.UpdateProbe(ctx, filterQuery, updateQuery)
	if err != nil {
		return "", err
	}

	return "Updated successfully", nil
}

// GetProbe - List a single Probe
func (p *probe) GetProbe(ctx context.Context, probeName string) (*model.Probe, error) {

	probe, err := dbSchemaProbe.GetProbeByName(ctx, probeName, p.ProjectID)
	if err != nil {
		return nil, err
	}

	return probe.GetOutputProbe(), nil
}

// GetProbeYAMLData - Get the probe yaml data compatible with the chaos engine manifest
func (p *probe) GetProbeYAMLData(ctx context.Context, probeRequest model.GetProbeYAMLRequest) (string, error) {

	probe, err := dbSchemaProbe.GetProbeByName(ctx, probeRequest.ProbeName, p.ProjectID)
	if err != nil {
		return "", err
	}

	if model.ProbeType(probe.Type) == model.ProbeTypeHTTPProbe {

		var _probe HTTPProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(probeRequest.Mode)
		_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
			URL: probe.KubernetesHTTPProperties.URL,
		}

		if probe.KubernetesHTTPProperties.InsecureSkipVerify != nil {
			_probe.HTTPProbeInputs.InsecureSkipVerify = *probe.KubernetesHTTPProperties.InsecureSkipVerify
		}

		if probe.KubernetesHTTPProperties.Method.GET != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     probe.KubernetesHTTPProperties.Method.GET.Criteria,
						ResponseCode: probe.KubernetesHTTPProperties.Method.GET.ResponseCode,
					},
				},
			}
		} else if probe.KubernetesHTTPProperties.Method.POST != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				Method: v1alpha1.HTTPMethod{
					Post: &v1alpha1.PostMethod{
						Criteria:     probe.KubernetesHTTPProperties.Method.POST.Criteria,
						ResponseCode: probe.KubernetesHTTPProperties.Method.POST.ResponseCode,
					},
				},
			}

			if probe.KubernetesHTTPProperties.Method.POST.ContentType != nil {
				_probe.HTTPProbeInputs.Method.Post.ContentType = *probe.KubernetesHTTPProperties.Method.POST.ContentType
			}

			if probe.KubernetesHTTPProperties.Method.POST.Body != nil {
				_probe.HTTPProbeInputs.Method.Post.Body = *probe.KubernetesHTTPProperties.Method.POST.Body
			}

			if probe.KubernetesHTTPProperties.Method.POST.BodyPath != nil {
				_probe.HTTPProbeInputs.Method.Post.BodyPath = *probe.KubernetesHTTPProperties.Method.POST.BodyPath
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.KubernetesHTTPProperties.ProbeTimeout,
			Interval:     probe.KubernetesHTTPProperties.Interval,
		}

		if probe.KubernetesHTTPProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.KubernetesHTTPProperties.Retry
		}

		if probe.KubernetesHTTPProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.KubernetesHTTPProperties.Attempt
		}

		if probe.KubernetesHTTPProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.KubernetesHTTPProperties.PollingInterval
		}

		if probe.KubernetesHTTPProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.KubernetesHTTPProperties.EvaluationTimeout
		}

		if probe.KubernetesHTTPProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.KubernetesHTTPProperties.InitialDelay
		}

		if probe.KubernetesHTTPProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.KubernetesHTTPProperties.StopOnFailure
		}

		y, err := yaml.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if model.ProbeType(probe.Type) == model.ProbeTypeCmdProbe {

		var _probe CMDProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(probeRequest.Mode)
		_probe.CmdProbeInputs = v1alpha1.CmdProbeInputs{
			Command: probe.KubernetesCMDProperties.Command,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.KubernetesCMDProperties.Comparator.Type,
				Criteria: probe.KubernetesCMDProperties.Comparator.Criteria,
				Value:    probe.KubernetesCMDProperties.Comparator.Value,
			},
		}

		if probe.KubernetesCMDProperties.Source != nil {
			// TODO: Add source volume and volume mount types
			_probe.CmdProbeInputs.Source = &v1alpha1.SourceDetails{
				Image:            probe.KubernetesCMDProperties.Source.Image,
				HostNetwork:      probe.KubernetesCMDProperties.Source.HostNetwork,
				InheritInputs:    probe.KubernetesCMDProperties.Source.InheritInputs,
				Args:             probe.KubernetesCMDProperties.Source.Args,
				ENVList:          probe.KubernetesCMDProperties.Source.ENVList,
				Labels:           probe.KubernetesCMDProperties.Source.Labels,
				Annotations:      probe.KubernetesCMDProperties.Source.Annotations,
				Command:          probe.KubernetesCMDProperties.Source.Command,
				ImagePullPolicy:  probe.KubernetesCMDProperties.Source.ImagePullPolicy,
				Privileged:       probe.KubernetesCMDProperties.Source.Privileged,
				NodeSelector:     probe.KubernetesCMDProperties.Source.NodeSelector,
				ImagePullSecrets: probe.KubernetesCMDProperties.Source.ImagePullSecrets,
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.KubernetesCMDProperties.ProbeTimeout,
			Interval:     probe.KubernetesCMDProperties.Interval,
		}

		if probe.KubernetesCMDProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.KubernetesCMDProperties.Retry
		}

		if probe.KubernetesCMDProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.KubernetesCMDProperties.Attempt
		}

		if probe.KubernetesCMDProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.KubernetesCMDProperties.PollingInterval
		}

		if probe.KubernetesCMDProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.KubernetesCMDProperties.EvaluationTimeout
		}

		if probe.KubernetesCMDProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.KubernetesCMDProperties.InitialDelay
		}

		if probe.KubernetesCMDProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.KubernetesCMDProperties.StopOnFailure
		}

		y, err := yaml.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if model.ProbeType(probe.Type) == model.ProbeTypePromProbe {

		var _probe PROMProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(probeRequest.Mode)
		_probe.PromProbeInputs = v1alpha1.PromProbeInputs{
			Endpoint: probe.PROMProperties.Endpoint,
			Query:    probe.PROMProperties.Query,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.PROMProperties.Comparator.Type,
				Criteria: probe.PROMProperties.Comparator.Criteria,
				Value:    probe.PROMProperties.Comparator.Value,
			},
		}

		if probe.PROMProperties.QueryPath != nil {
			_probe.PromProbeInputs.QueryPath = *probe.PROMProperties.QueryPath
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.PROMProperties.ProbeTimeout,
			Interval:     probe.PROMProperties.Interval,
		}

		if probe.PROMProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.PROMProperties.Retry
		}

		if probe.PROMProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.PROMProperties.Attempt
		}

		if probe.PROMProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.PROMProperties.PollingInterval
		}

		if probe.PROMProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.PROMProperties.EvaluationTimeout
		}

		if probe.PROMProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.PROMProperties.InitialDelay
		}

		if probe.PROMProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.PROMProperties.StopOnFailure
		}

		y, err := yaml.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if model.ProbeType(probe.Type) == model.ProbeTypeK8sProbe {

		var _probe K8SProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(probeRequest.Mode)
		_probe.K8sProbeInputs.Version = probe.K8SProperties.Version
		_probe.K8sProbeInputs.Resource = probe.K8SProperties.Resource
		_probe.K8sProbeInputs.Operation = probe.K8SProperties.Operation

		if probe.K8SProperties.Group != nil {
			_probe.K8sProbeInputs.Group = *probe.K8SProperties.Group
		}

		if probe.K8SProperties.ResourceNames != nil {
			_probe.K8sProbeInputs.ResourceNames = *probe.K8SProperties.ResourceNames
		}

		if probe.K8SProperties.Namespace != nil {
			_probe.K8sProbeInputs.Namespace = *probe.K8SProperties.Namespace
		}

		if probe.K8SProperties.FieldSelector != nil {
			_probe.K8sProbeInputs.FieldSelector = *probe.K8SProperties.FieldSelector
		}

		if probe.K8SProperties.LabelSelector != nil {
			_probe.K8sProbeInputs.LabelSelector = *probe.K8SProperties.LabelSelector
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.K8SProperties.ProbeTimeout,
			Interval:     probe.K8SProperties.Interval,
		}

		if probe.K8SProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.K8SProperties.Retry
		}

		if probe.K8SProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.K8SProperties.Attempt
		}

		if probe.K8SProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.K8SProperties.PollingInterval
		}

		if probe.K8SProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.K8SProperties.EvaluationTimeout
		}

		if probe.K8SProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.K8SProperties.InitialDelay
		}

		if probe.K8SProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.K8SProperties.StopOnFailure
		}

		y, err := yaml.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	}

	return "", err
}

// ListProbes - List a single/all Probes
func (p *probe) ListProbes(ctx context.Context, probeNames []string, infrastructureType *model.InfrastructureType, filter *model.ProbeFilterInput) ([]*model.Probe, error) {
	var pipeline mongo.Pipeline

	// Match the Probe Names from the input array
	if probeNames != nil && len(probeNames) != 0 {
		matchProbeName := bson.D{
			{
				Key: "$match", Value: bson.D{
					{"name", bson.D{
						{"$in", probeNames},
					}},
				},
			},
		}

		pipeline = append(pipeline, matchProbeName)
	}

	// Match the Infra from the input array
	if infrastructureType != nil {
		matchProbeInfra := bson.D{
			{
				Key: "$match", Value: bson.D{
					{"infrastructure_type", *infrastructureType},
				},
			},
		}

		pipeline = append(pipeline, matchProbeInfra)
	}
	// Match Filter options
	if filter != nil {
		// Filtering based on multi-select probe type
		if filter.Type != nil && len(filter.Type) != 0 {
			matchProbeType := bson.D{
				{
					Key: "$match", Value: bson.D{
						{"type", bson.D{
							{"$in", filter.Type},
						}},
					},
				},
			}
			pipeline = append(pipeline, matchProbeType)
		}

		// Filtering based on Probe Name
		if filter.Name != nil && *filter.Name != "" {
			matchProbeNameStage := bson.D{
				{"$match", bson.D{
					{"name", bson.D{
						{"$regex", filter.Name},
					}},
				}},
			}
			pipeline = append(pipeline, matchProbeNameStage)
		}

		// Filtering based on date range (experiment's last updated time)
		if filter.DateRange != nil {
			endDate := time.Now().UnixMilli()
			startDate, _ := strconv.ParseInt(filter.DateRange.StartDate, 10, 64)
			if filter.DateRange.EndDate != nil {
				endDate, _ = strconv.ParseInt(*filter.DateRange.EndDate, 10, 64)
			}

			filterProbeDateStage := bson.D{
				{
					"$match",
					bson.D{{"updated_at", bson.D{
						{"$lte", endDate},
						{"$gte", startDate},
					}}},
				},
			}
			pipeline = append(pipeline, filterProbeDateStage)
		}
	}

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{
			Key: "$match", Value: bson.D{
				{"project_id", p.ProjectID},
				{"is_removed", false},
			},
		},
	}
	pipeline = append(pipeline, matchIdentifierStage)

	var allProbes []dbSchemaProbe.Probe

	probeCursor, err := dbSchemaProbe.GetAggregateProbes(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	err = probeCursor.All(context.Background(), &allProbes)
	if err != nil {
		return nil, err
	}

	var probeDetails []*model.Probe

	for _, probe := range allProbes {
		var lastTenExecutions []*model.ProbeRecentExecutions
		recentExecutions, err := GetProbeExecutionHistoryInExperimentRuns(p.ProjectID, probe.Name)
		if err != nil {
			return nil, err
		}
		for i, executions := range recentExecutions {
			if len(recentExecutions) > 10 && i < (len(recentExecutions)-10) {
				continue
			} else {
				lastTenExecutions = append(lastTenExecutions, executions)
			}
		}

		probeDetail := probe.GetOutputProbe()

		probeDetail.RecentExecutions = lastTenExecutions

		referencedByCount := len(recentExecutions)
		probeDetail.ReferencedBy = &referencedByCount

		probeDetails = append(probeDetails, probeDetail)
	}

	return probeDetails, nil
}

func GetProbeExecutionHistoryInExperimentRuns(projectID string, probeName string) ([]*model.ProbeRecentExecutions, error) {
	var (
		pipeline         mongo.Pipeline
		expRuns          []dbChaosExperimentRun.ChaosExperimentRun
		recentExecutions []*model.ProbeRecentExecutions
	)

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
			{"probes.probe_names", probeName},
		}},
	}

	pipeline = append(pipeline, matchIdentifierStage)

	// Call aggregation on pipeline
	experimentRunOperator := dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodb.Operator)
	expRunCursor, err := experimentRunOperator.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	if err = expRunCursor.All(context.Background(), &expRuns); err != nil {
		return nil, errors.New("error decoding experiment run cursor: " + err.Error())
	}

	for _, execution := range expRuns {
		var executionData chaos_experiment.ExecutionData
		if execution.ExecutionData != "" {
			err = json.Unmarshal([]byte(execution.ExecutionData), &executionData)
			if err != nil {
				continue
			}
		}
		for _, fault := range execution.Probes {
			probeVerdict := model.ProbeVerdictNa

			if !utils.ContainsString(fault.ProbeNames, probeName) {
				continue
			}

			if len(executionData.Nodes) > 0 {
				for _, nodeData := range executionData.Nodes {
					if fault.FaultName == nodeData.Name {
						if (nodeData.Type == "ChaosEngine" || nodeData.Type == "LinuxTask") && nodeData.ChaosExp == nil {
							probeVerdict = model.ProbeVerdictNa
						} else if (nodeData.Type == "ChaosEngine" || nodeData.Type == "LinuxTask") && nodeData.ChaosExp != nil {
							probeVerdict = model.ProbeVerdictNa

							if nodeData.ChaosExp.ChaosResult != nil {
								probeVerdict = model.ProbeVerdictAwaited
								probeStatuses := nodeData.ChaosExp
								for _, probeStatus := range probeStatuses.ChaosResult.Status.ProbeStatuses {
									if probeStatus.Name == probeName {
										switch probeStatus.Status.Verdict {
										case v1alpha1.ProbeVerdictPassed:
											probeVerdict = model.ProbeVerdictPassed
										case v1alpha1.ProbeVerdictFailed:
											probeVerdict = model.ProbeVerdictFailed
										case v1alpha1.ProbeVerdictAwaited:
											probeVerdict = model.ProbeVerdictAwaited
										default:
											probeVerdict = model.ProbeVerdictNa
										}
									}
								}
							}
						}
					}
				}
				status := &model.Status{
					Verdict: probeVerdict,
				}

				recentExecution := &model.ProbeRecentExecutions{
					FaultName: fault.FaultName,
					Status:    status,
					ExecutedByExperiment: &model.ExecutedByExperiment{
						ExperimentID:   execution.ExperimentID,
						ExperimentName: execution.ExperimentName,
						UpdatedAt:      int(execution.UpdatedAt),
						UpdatedBy: &model.UserDetails{
							Username: execution.UpdatedBy.Username,
						},
					},
				}
				recentExecutions = append(recentExecutions, recentExecution)
			}
		}
	}

	return recentExecutions, nil
}

// DeleteProbe - Deletes a single Probe
func (p *probe) DeleteProbe(ctx context.Context, probeName string) (bool, error) {

	_, err := dbSchemaProbe.GetProbeByName(ctx, probeName, p.ProjectID)
	if err != nil {
		return false, err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	Time := time.Now().UnixMilli()

	query := bson.D{
		{"name", probeName},
		{"project_id", p.ProjectID},
		{"is_removed", false},
	}
	update := bson.D{
		{"$set", bson.D{
			{"is_removed", true},
			{"updated_at", Time},
			{"updated_by", username},
		}},
	}

	_, err = dbSchemaProbe.UpdateProbe(ctx, query, update)
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetProbeReference - Get the experiment details the probe is referencing to
func (p *probe) GetProbeReference(ctx context.Context, probeName string) (*model.GetProbeReferenceResponse, error) {

	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{{
				"$and", bson.A{
					bson.D{
						{"project_id", p.ProjectID},
						{"name", probeName},
						{"is_removed", false},
					},
				},
			}},
		},
	}
	pipeline = append(pipeline, matchIdentifiersStage)

	experimentWithSelectedProbeName := bson.D{
		{
			"$lookup",
			bson.D{
				{"from", "chaosExperimentRuns"},
				{
					"pipeline", bson.A{
						bson.D{{"$match", bson.D{
							{"probes.probe_names", bson.D{
								{"$eq", probeName},
							}},
						}}},
						bson.D{
							{"$project", bson.D{
								{"experiment_name", 1},
								{"probes.fault_name", 1},
								{"probes.probe_names", 1},
								{"phase", 1},
								{"updated_at", 1},
								{"updated_by", 1},
								{"execution_data", 1},
								{"experiment_id", 1},
							}},
						},
					},
				},
				{"as", "execution_history"},
			},
		},
	}
	pipeline = append(pipeline, experimentWithSelectedProbeName)

	// Call aggregation on pipeline
	probeCursor, err := dbSchemaProbe.GetAggregateProbes(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	var (
		totalRuns                = 0
		probeRuns                []dbSchemaProbe.ProbeWithExecutionHistory
		recentExecutions         []*model.RecentExecutions
		recentExecutionsMap      = make(map[string][]*model.RecentExecutions)
		executionHistoryResponse []*model.ExecutionHistory
	)

	if err = probeCursor.All(context.Background(), &probeRuns); err != nil {
		return nil, err
	}

	for _, runs := range probeRuns[0].ExecutionHistory {
		totalRuns++
		if len(runs.Probes) != 0 {
			for _, fault := range runs.Probes {
				if utils.ContainsString(fault.ProbeNames, probeName) {
					var executionData chaos_experiment.ExecutionData
					status := model.ProbeVerdictNa
					mode := model.ModeSot
					if runs.ExecutionData != "" {
						err := json.Unmarshal([]byte(runs.ExecutionData), &executionData)
						if err != nil {
							continue
						}
						if len(executionData.Nodes) > 0 {
							for _, nodeData := range executionData.Nodes {
								if nodeData.Name == fault.FaultName {
									if (nodeData.Type == "ChaosEngine" || nodeData.Type == "LinuxTask") && nodeData.ChaosExp == nil {
										status = model.ProbeVerdictNa
									} else if (nodeData.Type == "ChaosEngine" || nodeData.Type == "LinuxTask") && nodeData.ChaosExp != nil {
										status = model.ProbeVerdictNa

										if nodeData.ChaosExp.ChaosResult != nil {
											status = model.ProbeVerdictAwaited
											probeStatuses := nodeData.ChaosExp.ChaosResult.Status.ProbeStatuses

											for _, probeStatus := range probeStatuses {
												if probeStatus.Name == probeName {
													mode = model.Mode(probeStatus.Mode)
													switch probeStatus.Status.Verdict {
													case v1alpha1.ProbeVerdictPassed:
														status = model.ProbeVerdictPassed
														break
													case v1alpha1.ProbeVerdictFailed:
														status = model.ProbeVerdictFailed
														break
													case v1alpha1.ProbeVerdictAwaited:
														status = model.ProbeVerdictAwaited
														break
													default:
														status = model.ProbeVerdictNa
														break
													}
												}
											}
										}
									}
								}
							}
						}
						executionHistoryResponse = append(executionHistoryResponse, &model.ExecutionHistory{
							Mode:      mode,
							FaultName: fault.FaultName,
							Status: &model.Status{
								Verdict: status,
							},
							ExecutedByExperiment: &model.ExecutedByExperiment{
								ExperimentID:   runs.ExperimentID,
								ExperimentName: runs.ExperimentName,
								UpdatedAt:      runs.UpdatedAt,
								UpdatedBy: &model.UserDetails{
									Username: runs.UpdatedBy,
								},
							},
						})
					}

				}
			}
		}

	}

	for _, exeHistory := range executionHistoryResponse {
		recentExecutionsMap[exeHistory.FaultName] = append(recentExecutionsMap[exeHistory.FaultName], &model.RecentExecutions{
			FaultName: exeHistory.FaultName,
			Mode:      exeHistory.Mode,
		})
	}

	for name := range recentExecutionsMap {
		var lastTenExecutions []*model.ExecutionHistory
		for _, exeHistory := range executionHistoryResponse {
			if exeHistory.FaultName == name {
				lastTenExecutions = append(lastTenExecutions, exeHistory)
			}
		}

		// Reverse the order to make the latest execution shift to the right
		sort.Slice(lastTenExecutions, func(i, j int) bool {
			return lastTenExecutions[i].ExecutedByExperiment.UpdatedAt > lastTenExecutions[j].ExecutedByExperiment.UpdatedAt
		})
		if len(lastTenExecutions) > 10 {
			lastTenExecutions = lastTenExecutions[:10]
		}
		recentExecutionsMap[name][0].ExecutionHistory = lastTenExecutions
		recentExecutions = append(recentExecutions, recentExecutionsMap[name][0])
	}

	sort.Slice(recentExecutions, func(i, j int) bool {
		return recentExecutions[i].ExecutionHistory[len(recentExecutions[i].ExecutionHistory)-1].ExecutedByExperiment.UpdatedAt > recentExecutions[j].ExecutionHistory[len(recentExecutions[j].ExecutionHistory)-1].ExecutedByExperiment.UpdatedAt
	})

	_probeReference := &model.GetProbeReferenceResponse{
		ProjectID:        probeRuns[0].ProjectID,
		Name:             probeRuns[0].Name,
		TotalRuns:        totalRuns,
		RecentExecutions: recentExecutions,
	}

	return _probeReference, err
}

// ValidateUniqueProbe - Validates the uniqueness of the probe, returns true if unique
func (p *probe) ValidateUniqueProbe(ctx context.Context, probeName string) (bool, error) {

	query := bson.D{
		{"name", probeName},
		{"project_id", p.ProjectID},
	}

	isUnique, err := dbSchemaProbe.IsProbeUnique(ctx, query)
	if err != nil {
		return false, err
	}

	return isUnique, nil
}
