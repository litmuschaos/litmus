package handler

import (
	"context"
	"encoding/json"
	"errors"
	"sort"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/utils"
	globalUtils "github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Service interface {
	AddProbe(ctx context.Context, probe model.ProbeRequest, projectID string) (*model.Probe, error)
	UpdateProbe(ctx context.Context, probe model.ProbeRequest, projectID string) (string, error)
	ListProbes(ctx context.Context, probeNames []string, infrastructureType *model.InfrastructureType, filter *model.ProbeFilterInput, projectID string) ([]*model.Probe, error)
	DeleteProbe(ctx context.Context, probeName, projectID string) (bool, error)
	GetProbe(ctx context.Context, probeName, projectID string) (*model.Probe, error)
	GetProbeReference(ctx context.Context, probeName, projectID string) (*model.GetProbeReferenceResponse, error)
	GetProbeYAMLData(ctx context.Context, probe model.GetProbeYAMLRequest, projectID string) (string, error)
	ValidateUniqueProbe(ctx context.Context, probeName, projectID string) (bool, error)
}

type probe struct{}

func NewProbeService() Service {
	return &probe{}
}

func Error(logFields logrus.Fields, message string) error {
	logrus.WithFields(logFields).Error(message)
	return errors.New(message)
}

// AddProbe - Create a new Probe
func (p *probe) AddProbe(ctx context.Context, probe model.ProbeRequest, projectID string) (*model.Probe, error) {
	// TODO: Add check if probe exists

	var (
		currTime = time.Now().UnixMilli()
	)
	tkn, ok := ctx.Value(authorization.AuthKey).(string)
	if !ok {
		return nil, errors.New("JWT token not found")
	}

	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return nil, err
	}

	logFields := logrus.Fields{
		"projectId": projectID,
		"probeName": probe.Name,
	}

	logrus.WithFields(logFields).Info("adding ", probe.Type, " probe")

	// Shared Properties

	newProbe := &dbSchemaProbe.Probe{
		ResourceDetails: mongodb.ResourceDetails{
			Name: probe.Name,
			Tags: probe.Tags,
		},
		ProjectID: projectID,
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

	if probe.Description != nil {
		newProbe.Description = *probe.Description
	}

	// Check the respective probe type and modify the property response based on the type
	if probe.Type == model.ProbeTypeHTTPProbe && probe.KubernetesHTTPProperties != nil {
		utils.AddKubernetesHTTPProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeCmdProbe && probe.KubernetesCMDProperties != nil {
		utils.AddKubernetesCMDProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypePromProbe && probe.PromProperties != nil {
		utils.AddPROMProbeProperties(newProbe, probe)
	} else if probe.Type == model.ProbeTypeK8sProbe && probe.K8sProperties != nil {
		utils.AddK8SProbeProperties(newProbe, probe)
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
func (p *probe) UpdateProbe(ctx context.Context, request model.ProbeRequest, projectID string) (string, error) {
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}

	pr, err := dbSchemaProbe.GetProbeByName(ctx, request.Name, projectID)
	if err != nil {
		return "", err
	}

	// Shared Properties
	newProbe := &dbSchemaProbe.Probe{
		ResourceDetails: mongodb.ResourceDetails{
			Name: request.Name,
			Tags: request.Tags,
		},
		ProjectID: projectID,
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

	if request.Description != nil {
		newProbe.Description = *request.Description
	}

	if pr.InfrastructureType == model.InfrastructureTypeKubernetes {
		switch model.ProbeType(pr.Type) {
		case model.ProbeTypeHTTPProbe:
			utils.AddKubernetesHTTPProbeProperties(newProbe, request)
		case model.ProbeTypeCmdProbe:
			utils.AddKubernetesCMDProbeProperties(newProbe, request)
		case model.ProbeTypePromProbe:
			utils.AddPROMProbeProperties(newProbe, request)
		case model.ProbeTypeK8sProbe:
			utils.AddK8SProbeProperties(newProbe, request)
		}
	}

	if request.Type == model.ProbeTypeHTTPProbe && request.KubernetesHTTPProperties == nil {
		return "", errors.New("http probe type's properties are empty")
	} else if request.Type == model.ProbeTypeCmdProbe && request.KubernetesCMDProperties == nil {
		return "", errors.New("cmd probe type's properties are empty")
	} else if request.Type == model.ProbeTypePromProbe && request.PromProperties == nil {
		return "", errors.New("prom probe type's properties are empty")
	} else if request.Type == model.ProbeTypeK8sProbe && request.K8sProperties == nil {
		return "", errors.New("k8s probe type's properties are empty")
	}

	var updateQuery bson.D
	updateQuery = bson.D{
		{"$set", newProbe},
	}

	filterQuery := bson.D{
		{"name", request.Name},
		{"project_id", projectID},
		{"is_removed", false},
	}

	_, err = dbSchemaProbe.UpdateProbe(ctx, filterQuery, updateQuery)
	if err != nil {
		return "", err
	}

	return "Updated successfully", nil
}

// GetProbe - List a single Probe
func (p *probe) GetProbe(ctx context.Context, probeName, projectID string) (*model.Probe, error) {

	probe, err := dbSchemaProbe.GetProbeByName(ctx, probeName, projectID)
	if err != nil {
		return nil, err
	}

	return probe.GetOutputProbe(), nil
}

// GetProbeYAMLData - Get the probe yaml data compatible with the chaos engine manifest
func (p *probe) GetProbeYAMLData(ctx context.Context, probeRequest model.GetProbeYAMLRequest, projectID string) (string, error) {

	probe, err := dbSchemaProbe.GetProbeByName(ctx, probeRequest.ProbeName, projectID)
	if err != nil {
		return "", err
	}

	manifest, err := utils.GenerateProbeManifest(probe.GetOutputProbe(), probeRequest.Mode)
	if err != nil {
		return "", err
	}

	return manifest, err
}

// ListProbes - List a single/all Probes
func (p *probe) ListProbes(ctx context.Context, probeNames []string, infrastructureType *model.InfrastructureType, filter *model.ProbeFilterInput, projectID string) ([]*model.Probe, error) {
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
					bson.D{
						{
							"updated_at",
							bson.D{
								{
									"$lte",
									endDate,
								},
								{
									"$gte",
									startDate,
								},
							},
						},
					},
				},
			}
			pipeline = append(pipeline, filterProbeDateStage)
		}
	}

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{
			Key: "$match", Value: bson.D{
				{"project_id", projectID},
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
		recentExecutions, err := GetProbeExecutionHistoryInExperimentRuns(projectID, probe.Name)
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
		{
			"$match", bson.D{
				{"project_id", projectID},
				{"probes.probe_names", probeName},
			},
		},
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

			if !globalUtils.ContainsString(fault.ProbeNames, probeName) {
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
func (p *probe) DeleteProbe(ctx context.Context, probeName, projectID string) (bool, error) {

	_, err := dbSchemaProbe.GetProbeByName(ctx, probeName, projectID)
	if err != nil {
		return false, err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	Time := time.Now().UnixMilli()

	query := bson.D{
		{"name", probeName},
		{"project_id", projectID},
		{"is_removed", false},
	}
	update := bson.D{
		{"$set", bson.D{
			{"is_removed", true},
			{"updated_at", Time},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		}},
	}

	_, err = dbSchemaProbe.UpdateProbe(ctx, query, update)
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetProbeReference - Get the experiment details the probe is referencing to
func (p *probe) GetProbeReference(ctx context.Context, probeName, projectID string) (*model.GetProbeReferenceResponse, error) {

	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{
				{
					"$and", bson.A{
						bson.D{
							{"project_id", projectID},
							{"name", probeName},
							{"is_removed", false},
						},
					},
				},
			},
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
				if globalUtils.ContainsString(fault.ProbeNames, probeName) {
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
									Username: runs.UpdatedBy.Username,
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
func (p *probe) ValidateUniqueProbe(ctx context.Context, probeName, projectID string) (bool, error) {

	query := bson.D{
		{"name", probeName},
		{"project_id", projectID},
	}

	isUnique, err := dbSchemaProbe.IsProbeUnique(ctx, query)
	if err != nil {
		return false, err
	}

	return isUnique, nil
}
