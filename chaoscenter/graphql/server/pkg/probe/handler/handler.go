package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	argoTypes "github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/ghodss/yaml"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/utils"
	globalUtils "github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
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
	GenerateExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.Workflow, error)
	GenerateCronExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.CronWorkflow, error)
}

type probeService struct {
	probeOperator *dbSchemaProbe.Operator
}

func NewProbeService(probeOperator *dbSchemaProbe.Operator) Service {
	return &probeService{
		probeOperator: probeOperator,
	}
}

func Error(logFields logrus.Fields, message string) error {
	logrus.WithFields(logFields).Error(message)
	return errors.New(message)
}

// AddProbe - Create a new Probe
func (p *probeService) AddProbe(ctx context.Context, probe model.ProbeRequest, projectID string) (*model.Probe, error) {
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
		_, err := utils.AddKubernetesCMDProbeProperties(newProbe, probe)
		if err != nil {
			return nil, fmt.Errorf("%s: %s", "error adding cmd probe properties", err.Error())
		}
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
	err = p.probeOperator.CreateProbe(ctx, *newProbe)
	if err != nil {
		return nil, err
	}

	return newProbe.GetOutputProbe(), nil
}

// UpdateProbe - Update a new Probe
func (p *probeService) UpdateProbe(ctx context.Context, request model.ProbeRequest, projectID string) (string, error) {
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}

	pr, err := p.probeOperator.GetProbeByName(ctx, request.Name, projectID)
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
			_, err := utils.AddKubernetesCMDProbeProperties(newProbe, request)
			if err != nil {
				return "", err
			}
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

	_, err = p.probeOperator.UpdateProbe(ctx, filterQuery, updateQuery)
	if err != nil {
		return "", err
	}

	return "Updated successfully", nil
}

// GetProbe - List a single Probe
func (p *probeService) GetProbe(ctx context.Context, probeName, projectID string) (*model.Probe, error) {

	probe, err := p.probeOperator.GetProbeByName(ctx, probeName, projectID)
	if err != nil {
		return nil, err
	}

	return probe.GetOutputProbe(), nil
}

// GetProbeYAMLData - Get the probe yaml data compatible with the chaos engine manifest
func (p *probeService) GetProbeYAMLData(ctx context.Context, probeRequest model.GetProbeYAMLRequest, projectID string) (string, error) {

	probe, err := p.probeOperator.GetProbeByName(ctx, probeRequest.ProbeName, projectID)
	if err != nil {
		return "", err
	}

	manifest, err := p.GenerateProbeManifest(probe.GetOutputProbe(), probeRequest.Mode)
	if err != nil {
		return "", err
	}

	return manifest, err
}

// ListProbes - List a single/all Probes
func (p *probeService) ListProbes(ctx context.Context, probeNames []string, infrastructureType *model.InfrastructureType, filter *model.ProbeFilterInput, projectID string) ([]*model.Probe, error) {
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
				{"project_id", bson.D{{"$eq", projectID}}},
				{"is_removed", false},
			},
		},
	}
	pipeline = append(pipeline, matchIdentifierStage)

	var allProbes []dbSchemaProbe.Probe

	probeCursor, err := p.probeOperator.GetAggregateProbes(ctx, pipeline)
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
				{"project_id", bson.D{{"$eq", projectID}}},
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
func (p *probeService) DeleteProbe(ctx context.Context, probeName, projectID string) (bool, error) {

	_, err := p.probeOperator.GetProbeByName(ctx, probeName, projectID)
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

	_, err = p.probeOperator.UpdateProbe(ctx, query, update)
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetProbeReference - Get the experiment details the probe is referencing to
func (p *probeService) GetProbeReference(ctx context.Context, probeName, projectID string) (*model.GetProbeReferenceResponse, error) {

	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{
				{
					"$and", bson.A{
						bson.D{
							{"project_id", bson.D{{"$eq", projectID}}},
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
	probeCursor, err := p.probeOperator.GetAggregateProbes(ctx, pipeline)
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
func (p *probeService) ValidateUniqueProbe(ctx context.Context, probeName, projectID string) (bool, error) {

	query := bson.D{
		{"name", probeName},
		{"project_id", bson.D{{"$eq", projectID}}},
		{"is_removed", false},
	}

	isUnique, err := p.probeOperator.IsProbeUnique(ctx, query)
	if err != nil {
		return false, err
	}

	return isUnique, nil
}

// GenerateExperimentManifestWithProbes - uses GenerateProbeManifest to get and store the respective probe attribute into Raw Data template for Non Cron Workflow
func (p *probeService) GenerateExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.Workflow, error) {
	var (
		backgroundContext = context.Background()
		nonCronManifest   argoTypes.Workflow
	)

	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	err := json.Unmarshal([]byte(manifest), &nonCronManifest)
	if err != nil {
		return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal experiment manifest, error: %s", err.Error())
	}

	for i, template := range nonCronManifest.Spec.Templates {
		artifact := template.Inputs.Artifacts

		if len(artifact) > 0 {
			if artifact[0].Raw == nil {
				continue
			}
			data := artifact[0].Raw.Data
			if len(data) > 0 {
				var (
					meta       v1alpha1.ChaosEngine
					annotation = make(map[string]string)
					probes     []v1alpha1.ProbeAttributes
					httpProbe  HTTPProbeAttributes
					cmdProbe   CMDProbeAttributes
					promProbe  PROMProbeAttributes
					k8sProbe   K8SProbeAttributes
				)

				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal chaosengine, error: %s", err.Error())
				}
				if strings.ToLower(meta.Kind) == "chaosengine" {

					probes = meta.Spec.Experiments[0].Spec.Probe

					if meta.Annotations != nil {
						annotation = meta.Annotations
					}

					for _, key := range annotation {
						var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
						if strings.HasPrefix(key, "[{\"name\"") {
							err := json.Unmarshal([]byte(key), &manifestAnnotation)
							if err != nil {
								return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal experiment annotation object, error: %s", err.Error())
							}
							for _, annotationKey := range manifestAnnotation {
								probe, err := p.probeOperator.GetProbeByName(ctx, annotationKey.Name, projectID)
								if err != nil {
									return argoTypes.Workflow{}, fmt.Errorf("failed to fetch probe details, error: %s", err.Error())
								}
								probeManifestString, err := p.GenerateProbeManifest(probe.GetOutputProbe(), annotationKey.Mode)
								if err != nil {
									return argoTypes.Workflow{}, fmt.Errorf("failed to generate probe manifest, error: %s", err.Error())
								}

								if model.ProbeType(probe.Type) == model.ProbeTypeHTTPProbe {
									err := json.Unmarshal([]byte(probeManifestString), &httpProbe)
									if err != nil {
										return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal http probe, error: %s", err.Error())
									}

									probes = append(probes, v1alpha1.ProbeAttributes{
										Name: httpProbe.Name,
										Type: httpProbe.Type,
										HTTPProbeInputs: &v1alpha1.HTTPProbeInputs{
											URL:                httpProbe.HTTPProbeInputs.URL,
											InsecureSkipVerify: httpProbe.HTTPProbeInputs.InsecureSkipVerify,
											Method:             httpProbe.HTTPProbeInputs.Method,
										},
										RunProperties: httpProbe.RunProperties,
										Mode:          httpProbe.Mode,
									})
								} else if model.ProbeType(probe.Type) == model.ProbeTypeCmdProbe {
									err := json.Unmarshal([]byte(probeManifestString), &cmdProbe)
									if err != nil {
										return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal cmd probe, error: %s", err.Error())
									}

									probes = append(probes, v1alpha1.ProbeAttributes{
										Name: cmdProbe.Name,
										Type: cmdProbe.Type,
										CmdProbeInputs: &v1alpha1.CmdProbeInputs{
											Command:    cmdProbe.CmdProbeInputs.Command,
											Comparator: cmdProbe.CmdProbeInputs.Comparator,
											Source:     cmdProbe.CmdProbeInputs.Source,
										},
										RunProperties: cmdProbe.RunProperties,
										Mode:          cmdProbe.Mode,
									})
								} else if model.ProbeType(probe.Type) == model.ProbeTypePromProbe {
									err := json.Unmarshal([]byte(probeManifestString), &promProbe)
									if err != nil {
										return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal prom probe, error: %s", err.Error())
									}

									probes = append(probes, v1alpha1.ProbeAttributes{
										Name: promProbe.Name,
										Type: promProbe.Type,
										PromProbeInputs: &v1alpha1.PromProbeInputs{
											Endpoint:   promProbe.PromProbeInputs.Endpoint,
											Query:      promProbe.PromProbeInputs.Query,
											QueryPath:  promProbe.PromProbeInputs.QueryPath,
											Comparator: promProbe.PromProbeInputs.Comparator,
										},
										RunProperties: promProbe.RunProperties,
										Mode:          promProbe.Mode,
									})
								} else if model.ProbeType(probe.Type) == model.ProbeTypeK8sProbe {
									err := json.Unmarshal([]byte(probeManifestString), &k8sProbe)
									if err != nil {
										return argoTypes.Workflow{}, fmt.Errorf("failed to unmarshal k8s probe, error: %s", err.Error())
									}

									probes = append(probes, v1alpha1.ProbeAttributes{
										Name: k8sProbe.Name,
										Type: k8sProbe.Type,
										K8sProbeInputs: &v1alpha1.K8sProbeInputs{
											Group:         k8sProbe.K8sProbeInputs.Group,
											Version:       k8sProbe.K8sProbeInputs.Version,
											Resource:      k8sProbe.K8sProbeInputs.Resource,
											ResourceNames: k8sProbe.K8sProbeInputs.ResourceNames,
											Namespace:     k8sProbe.K8sProbeInputs.Namespace,
											FieldSelector: k8sProbe.K8sProbeInputs.FieldSelector,
											LabelSelector: k8sProbe.K8sProbeInputs.LabelSelector,
											Operation:     k8sProbe.K8sProbeInputs.Operation,
										},
										RunProperties: k8sProbe.RunProperties,
										Mode:          k8sProbe.Mode,
									})
								}
							}
						}
					}

					if len(meta.Spec.Experiments) > 0 {
						meta.Spec.Experiments[0].Spec.Probe = probes
					}

					res, err := yaml.Marshal(&meta)
					if err != nil {
						return argoTypes.Workflow{}, errors.New("failed to marshal chaosengine")
					}
					nonCronManifest.Spec.Templates[i].Inputs.Artifacts[0].Raw.Data = string(res)
				}
			}
		}
	}

	return nonCronManifest, nil
}

// GenerateCronExperimentManifestWithProbes - uses GenerateProbeManifest to get and store the respective probe attribute into Raw Data template
func (p *probeService) GenerateCronExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.CronWorkflow, error) {
	var (
		backgroundContext = context.Background()
		cronManifest      argoTypes.CronWorkflow
	)

	ctx, cancel := context.WithTimeout(backgroundContext, 10*time.Second)
	defer cancel()

	if err := json.Unmarshal([]byte(manifest), &cronManifest); err != nil {
		return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal experiment manifest, error: %s", err.Error())
	}

	for i, template := range cronManifest.Spec.WorkflowSpec.Templates {
		artifact := template.Inputs.Artifacts

		if len(artifact) > 0 {
			if artifact[0].Raw == nil {
				continue
			}
			data := artifact[0].Raw.Data
			if len(data) > 0 {
				var (
					meta       v1alpha1.ChaosEngine
					annotation = make(map[string]string)
					probes     []v1alpha1.ProbeAttributes
					httpProbe  HTTPProbeAttributes
					cmdProbe   CMDProbeAttributes
					promProbe  PROMProbeAttributes
					k8sProbe   K8SProbeAttributes
				)

				if err := yaml.Unmarshal([]byte(data), &meta); err != nil {
					return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal chaosengine, error: %s", err.Error())
				}

				if strings.ToLower(meta.Kind) == "chaosengine" {

					probes = meta.Spec.Experiments[0].Spec.Probe

					if meta.Annotations != nil {
						annotation = meta.Annotations
					}

					for _, key := range annotation {
						var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
						err := json.Unmarshal([]byte(key), &manifestAnnotation)
						if err != nil {
							return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal experiment annotation object, error: %s", err.Error())
						}
						for _, annotationKey := range manifestAnnotation {
							probe, err := p.probeOperator.GetProbeByName(ctx, annotationKey.Name, projectID)
							if err != nil {
								return argoTypes.CronWorkflow{}, fmt.Errorf("failed to fetch probe details, error: %s", err.Error())
							}

							probeManifestString, err := p.GenerateProbeManifest(probe.GetOutputProbe(), annotationKey.Mode)

							if model.ProbeType(probe.Type) == model.ProbeTypeHTTPProbe {
								if err := json.Unmarshal([]byte(probeManifestString), &httpProbe); err != nil {
									return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal http probe, error: %s", err.Error())
								}

								probes = append(probes, v1alpha1.ProbeAttributes{
									Name: httpProbe.Name,
									Type: httpProbe.Type,
									HTTPProbeInputs: &v1alpha1.HTTPProbeInputs{
										URL:                httpProbe.HTTPProbeInputs.URL,
										InsecureSkipVerify: httpProbe.HTTPProbeInputs.InsecureSkipVerify,
										Method:             httpProbe.HTTPProbeInputs.Method,
									},
									RunProperties: httpProbe.RunProperties,
									Mode:          httpProbe.Mode,
								})
							} else if model.ProbeType(probe.Type) == model.ProbeTypeCmdProbe {
								if err := json.Unmarshal([]byte(probeManifestString), &cmdProbe); err != nil {
									return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal cmd probe, error: %s", err.Error())
								}

								probes = append(probes, v1alpha1.ProbeAttributes{
									Name: cmdProbe.Name,
									Type: cmdProbe.Type,
									CmdProbeInputs: &v1alpha1.CmdProbeInputs{
										Command:    cmdProbe.CmdProbeInputs.Command,
										Comparator: cmdProbe.CmdProbeInputs.Comparator,
										Source:     cmdProbe.CmdProbeInputs.Source,
									},
									RunProperties: cmdProbe.RunProperties,
									Mode:          cmdProbe.Mode,
								})
							} else if model.ProbeType(probe.Type) == model.ProbeTypePromProbe {
								if err := json.Unmarshal([]byte(probeManifestString), &promProbe); err != nil {
									return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal prom probe, error: %s", err.Error())
								}

								probes = append(probes, v1alpha1.ProbeAttributes{
									Name: promProbe.Name,
									Type: promProbe.Type,
									PromProbeInputs: &v1alpha1.PromProbeInputs{
										Endpoint:   promProbe.PromProbeInputs.Endpoint,
										Query:      promProbe.PromProbeInputs.Query,
										QueryPath:  promProbe.PromProbeInputs.QueryPath,
										Comparator: promProbe.PromProbeInputs.Comparator,
									},
									RunProperties: promProbe.RunProperties,
									Mode:          promProbe.Mode,
								})
							} else if model.ProbeType(probe.Type) == model.ProbeTypeK8sProbe {
								if err := json.Unmarshal([]byte(probeManifestString), &k8sProbe); err != nil {
									return argoTypes.CronWorkflow{}, fmt.Errorf("failed to unmarshal k8s probe, error: %s", err.Error())
								}

								probes = append(probes, v1alpha1.ProbeAttributes{
									Name: k8sProbe.Name,
									Type: k8sProbe.Type,
									K8sProbeInputs: &v1alpha1.K8sProbeInputs{
										Group:         k8sProbe.K8sProbeInputs.Group,
										Version:       k8sProbe.K8sProbeInputs.Version,
										Resource:      k8sProbe.K8sProbeInputs.Resource,
										ResourceNames: k8sProbe.K8sProbeInputs.ResourceNames,
										Namespace:     k8sProbe.K8sProbeInputs.Namespace,
										FieldSelector: k8sProbe.K8sProbeInputs.FieldSelector,
										LabelSelector: k8sProbe.K8sProbeInputs.LabelSelector,
										Operation:     k8sProbe.K8sProbeInputs.Operation,
									},
									RunProperties: k8sProbe.RunProperties,
									Mode:          k8sProbe.Mode,
								})
							}
						}
					}

					if len(meta.Spec.Experiments) > 0 {
						meta.Spec.Experiments[0].Spec.Probe = probes
					}

					res, err := yaml.Marshal(&meta)
					if err != nil {
						return argoTypes.CronWorkflow{}, fmt.Errorf("failed to marshal chaosengine, error: %s", err.Error())
					}
					cronManifest.Spec.WorkflowSpec.Templates[i].Inputs.Artifacts[0].Raw.Data = string(res)
				}
			}
		}
	}

	return cronManifest, nil
}

// GenerateProbeManifest - Generates the types and returns a marshalled probe attribute configuration
func (p *probeService) GenerateProbeManifest(probe *model.Probe, mode model.Mode) (string, error) {
	if probe.Type == model.ProbeTypeHTTPProbe {

		httpProbeURL := probe.KubernetesHTTPProperties.URL
		var _probe HTTPProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(mode)

		if probe.KubernetesHTTPProperties.InsecureSkipVerify != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				InsecureSkipVerify: *probe.KubernetesHTTPProperties.InsecureSkipVerify,
			}
		}

		if probe.KubernetesHTTPProperties.Method.Get != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				URL: httpProbeURL,
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     probe.KubernetesHTTPProperties.Method.Get.Criteria,
						ResponseCode: probe.KubernetesHTTPProperties.Method.Get.ResponseCode,
					},
				},
			}
		} else if probe.KubernetesHTTPProperties.Method.Post != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				URL: httpProbeURL,
				Method: v1alpha1.HTTPMethod{
					Post: &v1alpha1.PostMethod{
						Criteria:     probe.KubernetesHTTPProperties.Method.Post.Criteria,
						ResponseCode: probe.KubernetesHTTPProperties.Method.Post.ResponseCode,
					},
				},
			}

			if probe.KubernetesHTTPProperties.Method.Post.ContentType != nil {
				_probe.HTTPProbeInputs.Method.Post.ContentType = *probe.KubernetesHTTPProperties.Method.Post.ContentType
			}

			if probe.KubernetesHTTPProperties.Method.Post.Body != nil {
				_probe.HTTPProbeInputs.Method.Post.Body = *probe.KubernetesHTTPProperties.Method.Post.Body
			}

			if probe.KubernetesHTTPProperties.Method.Post.BodyPath != nil {
				_probe.HTTPProbeInputs.Method.Post.BodyPath = *probe.KubernetesHTTPProperties.Method.Post.BodyPath
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.KubernetesHTTPProperties.ProbeTimeout,
			Interval:     probe.KubernetesHTTPProperties.Interval,
		}

		if probe.KubernetesHTTPProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.KubernetesHTTPProperties.Attempt
		}

		if probe.KubernetesHTTPProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.KubernetesHTTPProperties.Retry
		}

		if probe.KubernetesHTTPProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.KubernetesHTTPProperties.ProbePollingInterval
		}

		if probe.KubernetesHTTPProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.KubernetesHTTPProperties.EvaluationTimeout
		}

		if probe.KubernetesHTTPProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.KubernetesHTTPProperties.StopOnFailure
		}

		y, err := json.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if probe.Type == model.ProbeTypeCmdProbe {

		var _probe CMDProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(mode)
		_probe.CmdProbeInputs = v1alpha1.CmdProbeInputs{
			Command: probe.KubernetesCMDProperties.Command,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.KubernetesCMDProperties.Comparator.Type,
				Criteria: probe.KubernetesCMDProperties.Comparator.Criteria,
				Value:    probe.KubernetesCMDProperties.Comparator.Value,
			},
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.KubernetesCMDProperties.ProbeTimeout,
			Interval:     probe.KubernetesCMDProperties.Interval,
		}

		if probe.KubernetesCMDProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.KubernetesCMDProperties.Attempt
		}

		if probe.KubernetesCMDProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.KubernetesCMDProperties.Retry
		}

		if probe.KubernetesCMDProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.KubernetesCMDProperties.ProbePollingInterval
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

		if probe.KubernetesCMDProperties.Source != nil {
			var source v1alpha1.SourceDetails
			err := json.Unmarshal([]byte(*probe.KubernetesCMDProperties.Source), &source)
			if err != nil {
				logrus.Warnf("error unmarshalling soruce: %s - the source part of the probe is being ignored", err.Error())
			}
			_probe.CmdProbeInputs.Source = &source
		}

		y, err := json.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if probe.Type == model.ProbeTypePromProbe {

		var _probe PROMProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(mode)
		_probe.PromProbeInputs = v1alpha1.PromProbeInputs{
			Endpoint: probe.PromProperties.Endpoint,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.PromProperties.Comparator.Type,
				Criteria: probe.PromProperties.Comparator.Criteria,
				Value:    probe.PromProperties.Comparator.Value,
			},
		}

		if probe.PromProperties.Query != nil {
			_probe.PromProbeInputs.Query = *probe.PromProperties.Query
		}

		if probe.PromProperties.QueryPath != nil {
			_probe.PromProbeInputs.QueryPath = *probe.PromProperties.QueryPath
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.PromProperties.ProbeTimeout,
			Interval:     probe.PromProperties.Interval,
		}

		if probe.PromProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.PromProperties.Attempt
		}

		if probe.PromProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.PromProperties.Retry
		}

		if probe.PromProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.PromProperties.ProbePollingInterval
		}

		if probe.PromProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.PromProperties.EvaluationTimeout
		}

		if probe.PromProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.PromProperties.InitialDelay
		}

		if probe.PromProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.PromProperties.StopOnFailure
		}

		y, err := json.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	} else if probe.Type == model.ProbeTypeK8sProbe {

		var _probe K8SProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(mode)
		_probe.K8sProbeInputs.Version = probe.K8sProperties.Version
		_probe.K8sProbeInputs.Resource = probe.K8sProperties.Resource
		_probe.K8sProbeInputs.Operation = probe.K8sProperties.Operation

		if probe.K8sProperties.Group != nil {
			_probe.K8sProbeInputs.Group = *probe.K8sProperties.Group
		}

		if probe.K8sProperties.Namespace != nil {
			_probe.K8sProbeInputs.Namespace = *probe.K8sProperties.Namespace
		}

		if probe.K8sProperties.FieldSelector != nil {
			_probe.K8sProbeInputs.FieldSelector = *probe.K8sProperties.FieldSelector
		}

		if probe.K8sProperties.LabelSelector != nil {
			_probe.K8sProbeInputs.LabelSelector = *probe.K8sProperties.LabelSelector
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.K8sProperties.ProbeTimeout,
			Interval:     probe.K8sProperties.Interval,
		}

		if probe.K8sProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.K8sProperties.Attempt
		}

		if probe.K8sProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.K8sProperties.Retry
		}

		if probe.K8sProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.K8sProperties.ProbePollingInterval
		}

		if probe.K8sProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.K8sProperties.EvaluationTimeout
		}

		if probe.K8sProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.K8sProperties.InitialDelay
		}

		if probe.K8sProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.K8sProperties.StopOnFailure
		}

		y, err := json.Marshal(_probe)
		if err != nil {
			return "", err
		}

		return string(y), err
	}
	return "", nil
}
