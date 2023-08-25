package probe

import (
	"context"
	"encoding/json"
	"errors"
	"sort"
	"strconv"
	"time"

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
	ListProbes(ctx context.Context, probeNames []string, filter *model.ProbeFilterInput) ([]*model.Probe, error)
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
			CreatedBy: username,
			UpdatedBy: username,
		},
		Type: dbSchemaProbe.ProbeType(probe.Type),
	}

	// Check the respective probe type and modify the property response based on the type
	if probe.Type == model.ProbeTypeHTTPProbe && probe.HTTPProperties != nil {
		addHTTPProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeCmdProbe && probe.CmdProperties != nil {
		addCMDProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypePromProbe && probe.PromProperties != nil {
		addPROMProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeK8sProbe && probe.K8sProperties != nil {
		addK8SProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeHTTPProbe && probe.HTTPProperties == nil {
		return nil, Error(logFields, "http probe type's properties are empty")
	} else if probe.Type == model.ProbeTypeCmdProbe && probe.CmdProperties == nil {
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

	logFields := logrus.Fields{
		"projectId": p.ProjectID,
		"probeName": pr.Name,
	}
	uniqueProbe, err := p.ValidateUniqueProbe(ctx, request.Name)
	if err != nil {
		return "", err
	} else if uniqueProbe == true {
		return "", Error(logFields, "probe name doesn't exist")
	}

	if request.Type != model.ProbeType(pr.Type) {
		return "", Error(logFields, "mismatched probe types")
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
			UpdatedBy: username,
		},
		Type: pr.Type,
	}

	// Check the respective probe type and modify the property response based on the type
	if request.Type == model.ProbeTypeHTTPProbe && request.HTTPProperties != nil {
		addHTTPProbeProperties(newProbe, request)
	} else if request.Type == model.ProbeTypeCmdProbe && request.CmdProperties != nil {
		addCMDProbeProperties(newProbe, request)
	} else if request.Type == model.ProbeTypePromProbe && request.PromProperties != nil {
		addPROMProbeProperties(newProbe, request)
	} else if request.Type == model.ProbeTypeK8sProbe && request.K8sProperties != nil {
		addK8SProbeProperties(newProbe, request)
	} else if request.Type == model.ProbeTypeHTTPProbe && request.HTTPProperties == nil {
		return "", errors.New("http probe type's properties are empty")
	} else if request.Type == model.ProbeTypeCmdProbe && request.CmdProperties == nil {
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
			URL: probe.HTTPProperties.URL,
		}

		if probe.HTTPProperties.InsecureSkipVerify != nil {
			_probe.HTTPProbeInputs.InsecureSkipVerify = *probe.HTTPProperties.InsecureSkipVerify
		}

		if probe.HTTPProperties.Method.GET != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     probe.HTTPProperties.Method.GET.Criteria,
						ResponseCode: probe.HTTPProperties.Method.GET.ResponseCode,
					},
				},
			}
		} else if probe.HTTPProperties.Method.POST != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				Method: v1alpha1.HTTPMethod{
					Post: &v1alpha1.PostMethod{
						Criteria:     probe.HTTPProperties.Method.POST.Criteria,
						ResponseCode: probe.HTTPProperties.Method.POST.ResponseCode,
					},
				},
			}

			if probe.HTTPProperties.Method.POST.ContentType != nil {
				_probe.HTTPProbeInputs.Method.Post.ContentType = *probe.HTTPProperties.Method.POST.ContentType
			}

			if probe.HTTPProperties.Method.POST.Body != nil {
				_probe.HTTPProbeInputs.Method.Post.Body = *probe.HTTPProperties.Method.POST.Body
			}

			if probe.HTTPProperties.Method.POST.BodyPath != nil {
				_probe.HTTPProbeInputs.Method.Post.BodyPath = *probe.HTTPProperties.Method.POST.BodyPath
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.HTTPProperties.ProbeTimeout,
			Interval:     probe.HTTPProperties.Interval,
		}

		if probe.HTTPProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.HTTPProperties.Retry
		}

		if probe.HTTPProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.HTTPProperties.Attempt
		}

		if probe.HTTPProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.HTTPProperties.PollingInterval
		}

		if probe.HTTPProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.HTTPProperties.EvaluationTimeout
		}

		if probe.HTTPProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.HTTPProperties.InitialDelay
		}

		if probe.HTTPProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.HTTPProperties.StopOnFailure
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
			Command: probe.CMDProperties.Command,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.CMDProperties.Comparator.Type,
				Criteria: probe.CMDProperties.Comparator.Criteria,
				Value:    probe.CMDProperties.Comparator.Value,
			},
		}

		if probe.CMDProperties.Source != nil {
			// TODO: Add source volume and volume mount types
			_probe.CmdProbeInputs.Source = &v1alpha1.SourceDetails{
				Image:            probe.CMDProperties.Source.Image,
				HostNetwork:      probe.CMDProperties.Source.HostNetwork,
				InheritInputs:    probe.CMDProperties.Source.InheritInputs,
				Args:             probe.CMDProperties.Source.Args,
				ENVList:          probe.CMDProperties.Source.ENVList,
				Labels:           probe.CMDProperties.Source.Labels,
				Annotations:      probe.CMDProperties.Source.Annotations,
				Command:          probe.CMDProperties.Source.Command,
				ImagePullPolicy:  probe.CMDProperties.Source.ImagePullPolicy,
				Privileged:       probe.CMDProperties.Source.Privileged,
				NodeSelector:     probe.CMDProperties.Source.NodeSelector,
				ImagePullSecrets: probe.CMDProperties.Source.ImagePullSecrets,
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.CMDProperties.ProbeTimeout,
			Interval:     probe.CMDProperties.Interval,
		}

		if probe.CMDProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.CMDProperties.Retry
		}

		if probe.CMDProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.CMDProperties.Attempt
		}

		if probe.CMDProperties.PollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.CMDProperties.PollingInterval
		}

		if probe.CMDProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.CMDProperties.EvaluationTimeout
		}

		if probe.CMDProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.CMDProperties.InitialDelay
		}

		if probe.CMDProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.CMDProperties.StopOnFailure
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
func (p *probe) ListProbes(ctx context.Context, probeNames []string, filter *model.ProbeFilterInput) ([]*model.Probe, error) {
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
		executionData    chaos_experiment.ExecutionData
		probeStatusMap   = map[string]model.ProbeVerdict{}
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
		faultName := execution.Probes[0].FaultName

		probeStatusMap = make(map[string]model.ProbeVerdict)

		if err = json.Unmarshal([]byte(execution.ExecutionData), &executionData); err != nil {
			return nil, errors.New("failed to unmarshal experiment manifest")
		}

		probeStatusMap[probeName] = model.ProbeVerdictNa

		for _, probe := range execution.Probes {
			if faultName == probe.FaultName {
				if len(executionData.Nodes) > 0 {

					for _, nodeData := range executionData.Nodes {
						if nodeData.Name == faultName {
							if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp == nil {
								probeStatusMap[probeName] = model.ProbeVerdictNa
							} else if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp != nil {
								probeStatusMap[probeName] = model.ProbeVerdictNa

								if nodeData.ChaosExp.ChaosResult != nil {
									probeStatusMap[probeName] = model.ProbeVerdictAwaited
									probeStatuses := nodeData.ChaosExp.ChaosResult.Status.ProbeStatuses

									for _, probeStatus := range probeStatuses {

										if probeStatus.Name == probeName {

											switch probeStatus.Status.Verdict {
											case v1alpha1.ProbeVerdictPassed:
												probeStatusMap[probeName] = model.ProbeVerdictPassed
											case v1alpha1.ProbeVerdictFailed:
												probeStatusMap[probeName] = model.ProbeVerdictFailed
											case v1alpha1.ProbeVerdictAwaited:
												probeStatusMap[probeName] = model.ProbeVerdictAwaited
											default:
												probeStatusMap[probeName] = model.ProbeVerdictNa
											}
										}

									}
								}
							}
						}
					}
				}

				recentExecutions = append(recentExecutions, &model.ProbeRecentExecutions{
					FaultName: faultName,
					Status: &model.Status{
						Verdict: probeStatusMap[probeName],
					},
					ExecutedByExperiment: &model.ExecutedByExperiment{
						ExperimentID:   execution.ExperimentID,
						ExperimentName: execution.ExperimentName,
						UpdatedAt:      int(execution.UpdatedAt),
						UpdatedBy: &model.UserDetails{
							Username: execution.UpdatedBy,
						},
					},
				})

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
		totalRuns           = 0
		executionData       chaos_experiment.ExecutionData
		probeRuns           []dbSchemaProbe.ProbeWithExecutionHistory
		recentExecutions    []*model.RecentExecutions
		recentExecutionsMap = make(map[string][]*model.RecentExecutions)
	)

	if err = probeCursor.All(context.Background(), &probeRuns); err != nil {
		return nil, err
	}

	for _, individualExecution := range probeRuns[0].ExecutionHistory {

		faultName := individualExecution.Probes[0].FaultName
		mode := "SOT"

		totalRuns++
		var executionHistoryResponse []*model.ExecutionHistory

		for _, execution := range probeRuns[0].ExecutionHistory {

			status := model.ProbeVerdictNa

			if err = json.Unmarshal([]byte(execution.ExecutionData), &executionData); err != nil {
				return nil, errors.New("failed to unmarshal experiment manifest")
			}

			for _, probe := range execution.Probes {
				if faultName == probe.FaultName {
					if len(executionData.Nodes) > 0 {
						for _, nodeData := range executionData.Nodes {
							if nodeData.Name == faultName {
								if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp == nil {
									status = model.ProbeVerdictNa
								} else if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp != nil {
									status = model.ProbeVerdictNa

									if nodeData.ChaosExp.ChaosResult != nil {
										status = model.ProbeVerdictAwaited
										probeStatuses := nodeData.ChaosExp.ChaosResult.Status.ProbeStatuses

										for _, probeStatus := range probeStatuses {
											if probeStatus.Name == probeRuns[0].Name {
												mode = probeStatus.Mode
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
						Status: &model.Status{
							Verdict: status,
						},
						ExecutedByExperiment: &model.ExecutedByExperiment{
							ExperimentID:   execution.ExperimentID,
							ExperimentName: execution.ExperimentName,
							UpdatedAt:      execution.UpdatedAt,
							//UpdatedBy:      harness.FilterUserDetails(execution.UpdatedBy, userDetails),
						},
					})
				}
			}
		}

		for i, j := 0, len(executionHistoryResponse)-1; i < j; i, j = i+1, j-1 {
			j := len(executionHistoryResponse) - i - 1
			executionHistoryResponse[i], executionHistoryResponse[j] = executionHistoryResponse[j], executionHistoryResponse[i]
		}

		recentExecutionsMap[faultName] = append(recentExecutionsMap[faultName], &model.RecentExecutions{
			FaultName:        faultName,
			Mode:             model.Mode(mode),
			ExecutionHistory: executionHistoryResponse,
		})
	}

	for fault := range recentExecutionsMap {
		if len(recentExecutionsMap[fault]) != 0 {
			recentExecutions = append(recentExecutions, recentExecutionsMap[fault][0])
		}
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
		{"is_removed", false},
	}

	isUnique, err := dbSchemaProbe.IsProbeUnique(ctx, query)
	if err != nil {
		return false, err
	}

	return isUnique, nil
}
