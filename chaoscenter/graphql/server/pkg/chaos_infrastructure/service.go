package chaos_infrastructure

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/common"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/config"
	dbEnvironments "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	"github.com/sirupsen/logrus"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	// CIVersion specifies the version tag used for ci builds
	CIVersion             = "ci"
	ClusterScope   string = "cluster"
	NamespaceScope string = "namespace"
)

type Service interface {
	RegisterInfra(c context.Context, projectID string, input model.RegisterInfraRequest) (*model.RegisterInfraResponse, error)
	ConfirmInfraRegistration(request model.InfraIdentity, r store.StateData) (*model.ConfirmInfraRegistrationResponse, error)
	VerifyInfra(identity model.InfraIdentity) (*dbChaosInfra.ChaosInfra, error)
	DeleteInfra(ctx context.Context, projectID string, infraId string, r store.StateData) (string, error)
	ListInfras(projectID string, request *model.ListInfraRequest) (*model.ListInfraResponse, error)
	GetInfraDetails(ctx context.Context, infraID string, projectID string) (*model.Infra, error)
	SendInfraEvent(eventType, eventName, description string, infra model.Infra, r store.StateData)
	GetManifestWithInfraID(host string, infraID string, accessKey string) ([]byte, error)
	GetInfra(ctx context.Context, projectID string, infraID string) (*model.Infra, error)
	GetInfraStats(ctx context.Context, projectID string) (*model.GetInfraStatsResponse, error)
	GetVersionDetails() (*model.InfraVersionDetails, error)
	QueryServerVersion(ctx context.Context) (*model.ServerVersionResponse, error)
	PodLog(request model.PodLog, r store.StateData) (string, error)
	KubeNamespace(request model.KubeNamespaceData, r store.StateData) (string, error)
	KubeObj(request model.KubeObjectData, r store.StateData) (string, error)
	UpdateInfra(query bson.D, update bson.D) error
	GetDBInfra(infraID string) (dbChaosInfra.ChaosInfra, error)
}

type infraService struct {
	infraOperator *dbChaosInfra.Operator
	envOperator   *dbEnvironments.Operator
}

// NewChaosInfrastructureService returns a new instance of Service
func NewChaosInfrastructureService(infraOperator *dbChaosInfra.Operator, envOperator *dbEnvironments.Operator) Service {
	return &infraService{
		infraOperator: infraOperator,
		envOperator:   envOperator,
	}
}

// RegisterInfra creates an entry for a new infra in DB and generates the url used to apply manifest
func (in *infraService) RegisterInfra(c context.Context, projectID string, input model.RegisterInfraRequest) (*model.RegisterInfraResponse, error) {
	// Check if the infra_name exists under same project
	infraDetails, err := in.infraOperator.GetInfras(c, bson.D{
		{"infra_name", input.Name},
		{"is_removed", false},
		{"project_id", bson.D{{"$eq", projectID}}},
	})
	if err != nil {
		return nil, err
	}

	if infraDetails != nil || len(infraDetails) > 0 {
		return nil, errors.New("infra already exists in this project with the same name")
	}

	// Check if EnvironmentID is valid
	if _, err := in.envOperator.GetEnvironmentDetails(c, input.EnvironmentID, projectID); err != nil {
		return nil, errors.New("Invalid EnvironmentID")
	}

	if (*input.InfraNsExists && input.InfraNamespace == nil) || (*input.InfraNsExists && *input.InfraNamespace == "") {
		return nil, errors.New("InfraNamespace parameter is required if InfraNsExists is true")
	}

	var (
		infraID     = uuid.New().String()
		currentTime = time.Now()
	)

	tkn := c.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return nil, err
	}

	token, err := InfraCreateJWT(infraID)
	if err != nil {
		return &model.RegisterInfraResponse{}, err
	}

	if input.NodeSelector != nil {
		selectors := strings.Split(*input.NodeSelector, ",")

		for _, el := range selectors {
			kv := strings.Split(el, "=")
			if len(kv) != 2 {
				return nil, errors.New("node selector environment variable is not correct. Correct format: \"key1=value2,key2=value2\"")
			}

			if strings.Contains(kv[0], "\"") || strings.Contains(kv[1], "\"") {
				return nil, errors.New("node selector environment variable contains escape character(s). Correct format: \"key1=value2,key2=value2\"")
			}
		}
	}

	var tolerations []*dbChaosInfra.Toleration
	err = copier.Copy(&tolerations, input.Tolerations)
	if err != nil {
		return &model.RegisterInfraResponse{}, err
	}

	if input.Tags == nil || len(input.Tags) == 0 {
		input.Tags = []string{}
	}

	// TODO add mongo transaction
	newInfra := dbChaosInfra.ChaosInfra{
		InfraID: infraID,
		ResourceDetails: mongodb.ResourceDetails{
			Name:        input.Name,
			Description: *input.Description,
			Tags:        input.Tags,
		},
		ProjectID: projectID,
		Audit: mongodb.Audit{
			CreatedAt: currentTime.UnixMilli(),
			UpdatedAt: currentTime.UnixMilli(),
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
		EnvironmentID:  input.EnvironmentID,
		AccessKey:      utils.RandomString(32),
		PlatformName:   input.PlatformName,
		InfraNamespace: input.InfraNamespace,
		ServiceAccount: input.ServiceAccount,
		InfraScope:     input.InfraScope,
		InfraNsExists:  input.InfraNsExists,
		InfraSaExists:  input.InfraSaExists,
		Token:          token,
		InfraType:      string(input.InfrastructureType),
		NodeSelector:   input.NodeSelector,
		Tolerations:    tolerations,
		SkipSSL:        input.SkipSsl,
		StartTime:      strconv.FormatInt(currentTime.UnixMilli(), 10),
	}

	err = in.infraOperator.InsertInfra(context.TODO(), newInfra)
	if err != nil {
		return nil, err
	}

	envQuery := bson.D{
		{"project_id", bson.D{{"$eq", projectID}}},
		{"environment_id", input.EnvironmentID},
	}
	update := bson.D{
		{"$push", bson.D{
			{"infra_ids", infraID},
		}},
	}
	err = in.envOperator.UpdateEnvironment(context.TODO(), envQuery, update)
	if err != nil {
		return nil, err
	}

	reqHeader, ok := c.Value("request-header").(http.Header)
	if !ok {
		return nil, fmt.Errorf("unable to parse request header")
	}

	referrer := reqHeader.Get("Referer")
	if referrer == "" {
		return nil, fmt.Errorf("unable to parse referer header")
	}

	referrerURL, err := url.Parse(referrer)
	if err != nil {
		return nil, err
	}

	manifestYaml, err := GetK8sInfraYaml(fmt.Sprintf("%s://%s", referrerURL.Scheme, referrerURL.Host), newInfra)
	if err != nil {
		return nil, err
	}

	return &model.RegisterInfraResponse{
		InfraID:  newInfra.InfraID,
		Token:    token,
		Name:     newInfra.Name,
		Manifest: string(manifestYaml),
	}, nil
}

// DeleteInfra takes infraIDs and r parameters, deletes the infras from the database and sends a request to the subscriber for clean-up
func (in *infraService) DeleteInfra(ctx context.Context, projectID string, infraId string, r store.StateData) (string, error) {
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}

	query := bson.D{
		{"infra_id", infraId},
		{"project_id", bson.D{{"$eq", projectID}}},
		{"is_removed", false},
	}

	infra, err := in.infraOperator.GetInfra(infraId)
	if err != nil {
		return "", err
	}

	// Marking infra to be removed
	update := bson.D{
		{"$set", bson.D{
			{"is_removed", true},
			{"updated_at", time.Now().UnixMilli()},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		}},
	}
	err = in.infraOperator.UpdateInfra(context.TODO(), query, update)
	if err != nil {
		return "", err
	}
	envQuery := bson.D{
		{"project_id", bson.D{{"$eq", projectID}}},
		{"environment_id", infra.EnvironmentID},
	}
	updateQuery := bson.D{
		{"$pull", bson.D{
			{"infra_ids", infra.InfraID},
		}},
	}
	err = in.envOperator.UpdateEnvironment(context.TODO(), envQuery, updateQuery)
	if err != nil {
		return "", err
	}

	// TODO update the below condition and add subscriber

	requests := []string{
		`{
		   		"apiVersion": "v1",
		   		"kind": "ConfigMap",
		   		"metadata": {
					"name": "subscriber-config",
					"namespace": ` + *infra.InfraNamespace + `
		   		}
			}`,
		`{
				"apiVersion": "apps/v1",
				"kind": "Deployment",
				"metadata": {
					"labels": {
	                  "app": "subscriber",
	               },
					"namespace": ` + *infra.InfraNamespace + `
				}
			}`,
	}

	for _, request := range requests {
		SendRequestToSubscriber(SubscriberRequests{
			K8sManifest: request,
			RequestType: "delete",
			ProjectID:   infra.ProjectID,
			InfraID:     infra.InfraID,
			Namespace:   *infra.InfraNamespace,
			Username:    &username,
		}, r)
	}

	return "infra deleted successfully", nil
}

// GetInfra returns details of the requested infra
func (in *infraService) GetInfra(ctx context.Context, projectID string, infraID string) (*model.Infra, error) {

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return nil, err
	}

	var pipeline mongo.Pipeline

	// Match with identifiers and infra ID
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"infra_id", bson.D{{"$eq", infraID}}},
			{"project_id", bson.D{{"$eq", projectID}}},
			{"is_removed", false},
		}},
	}
	pipeline = append(pipeline, matchIdentifierStage)

	// Fetching experiment details
	fetchExperimentDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosExperiments"},
			{"localField", "infra_id"},
			{"foreignField", "infra_id"},
			{"as", "experimentDetails"},
		}},
	}

	pipeline = append(pipeline, fetchExperimentDetailsStage)

	matchStage := bson.D{
		{"$match", bson.D{
			{"experimentDetails.is_removed", false},
		}},
	}

	pipeline = append(pipeline, matchStage)

	addExpDetailsFieldsStage := bson.D{
		{"$addFields", bson.D{
			{"experimentDetails", bson.A{
				bson.D{
					{"exp_run_count", bson.D{
						{"$sum", "$experimentDetails.total_experiment_runs"},
					}},
					{"last_run_timestamp", bson.D{
						{"$max", "$experimentDetails.updated_at"},
					}},
					{"experiments_count", bson.D{
						{"$sum", 1},
					}},
				},
			}},
		}},
	}

	pipeline = append(pipeline, addExpDetailsFieldsStage)

	// Call aggregation on pipeline
	infraCursor, err := in.infraOperator.GetAggregateInfras(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	var (
		infraResponse *model.Infra
		infraDetails  []dbChaosInfra.ChaosInfraDetails
	)

	if err = infraCursor.All(context.Background(), &infraDetails); err != nil {
		return infraResponse, errors.New("error decoding infra cursor: " + err.Error())
	}

	if len(infraDetails) == 0 {
		return nil, errors.New("no matching infra")
	}

	for _, infra := range infraDetails {
		description := infra.Description

		infraResponse = &model.Infra{
			InfraID:          infra.InfraID,
			Name:             infra.Name,
			EnvironmentID:    infra.EnvironmentID,
			Description:      &description,
			PlatformName:     infra.PlatformName,
			IsActive:         infra.IsActive,
			IsInfraConfirmed: infra.IsInfraConfirmed,
			UpdatedAt:        strconv.FormatInt(infra.UpdatedAt, 10),
			CreatedAt:        strconv.FormatInt(infra.CreatedAt, 10),
			Token:            infra.Token,
			InfraNamespace:   infra.InfraNamespace,
			ServiceAccount:   infra.ServiceAccount,
			InfraScope:       infra.InfraScope,
			StartTime:        infra.StartTime,
			Version:          infra.Version,
			Tags:             infra.Tags,
			CreatedBy:        &model.UserDetails{Username: username},
			UpdatedBy: &model.UserDetails{
				Username: username,
			},
		}
		lastRun := strconv.FormatInt(infra.ExperimentDetails[0].LastRunTimestamp, 10)
		if len(infra.ExperimentDetails) > 0 {
			infraResponse.NoOfExperimentRuns = &infra.ExperimentDetails[0].TotalRuns
			infraResponse.LastExperimentTimestamp = &lastRun
			infraResponse.NoOfExperiments = &infra.ExperimentDetails[0].TotalSchedules
		}

		//var updateStatus model.UpdateStatus

		// Fetching the list of compatible versions
		//compatibleVersions := utils.Config.InfraCompatibleVersions

		//var compatibleArray []string
		//err = json.Unmarshal([]byte(compatibleVersions), &compatibleArray)
		//if err != nil {
		//	return nil, errors.New("error unmarshalling compatible versions: " + err.Error())
		//}
		//
		//// Storing compatible version in a map
		//compatibleMap := make(map[int]string)
		//for _, versionStr := range compatibleArray {
		//	versionInt, err := updateVersionFormat(versionStr)
		//	if err != nil {
		//		return nil, errors.New("error converting version to int: " + err.Error())
		//	}
		//	compatibleMap[versionInt] = versionStr
		//}

		// Fetching the latest version
		//latestVersion := fetchLatestVersion(compatibleMap)
		//// converting infra version from DB to int
		//infraVersion, err := updateVersionFormat(infra.Version)
		//if err != nil {
		//	return nil, err
		//}

		// Setting the default update status as mandatory
		//updateStatus = model.UpdateStatusMandatory
		//
		//// Checking if the infra version is already the latest supported version in the compatibility array
		//if infraVersion == latestVersion {
		//	updateStatus = model.UpdateStatusNotRequired
		//} else {
		//	for _, v := range compatibleMap {
		//		if v == infra.Version {
		//			updateStatus = model.UpdateStatusAvailable
		//			break
		//		}
		//	}
		//}
		//infraResponse.UpdateStatus = updateStatus
	}

	return infraResponse, nil
}

// ListInfras returns list of requested infras
func (in *infraService) ListInfras(projectID string, request *model.ListInfraRequest) (*model.ListInfraResponse, error) {

	var pipeline mongo.Pipeline

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", bson.D{{"$eq", projectID}}},
			{"is_removed", false},
		}},
	}
	pipeline = append(pipeline, matchIdentifierStage)
	if request != nil {
		// Match with environment IDs
		if request.EnvironmentIDs != nil && len(request.EnvironmentIDs) != 0 {
			matchEnvStage := bson.D{
				{"$match", bson.D{
					{"environment_id", bson.D{
						{"$in", request.EnvironmentIDs},
					}},
				}},
			}
			pipeline = append(pipeline, matchEnvStage)
		}

		// Match the infraIds from the input array
		if request.InfraIDs != nil && len(request.InfraIDs) != 0 {
			matchInfraIdStage := bson.D{
				{"$match", bson.D{
					{"infra_id", bson.D{
						{"$in", request.InfraIDs},
					}},
				}},
			}

			pipeline = append(pipeline, matchInfraIdStage)
		}

		// Filtering based on given parameters
		if request.Filter != nil {
			// Filtering based on chaos_infra name
			if request.Filter.Name != nil && *request.Filter.Name != "" {
				matchInfraNameStage := bson.D{
					{"$match", bson.D{
						{"name", bson.M{
							"$regex": request.Filter.Name, "$options": "mix",
						}},
					}},
				}
				pipeline = append(pipeline, matchInfraNameStage)
			}

			// Filtering based on chaos_infra ID
			if request.Filter.InfraID != nil && *request.Filter.InfraID != "" {
				matchInfraIDStage := bson.D{
					{"$match", bson.D{
						{"infra_id", request.Filter.InfraID},
					}},
				}
				pipeline = append(pipeline, matchInfraIDStage)
			}

			// Filtering based on platform name
			if request.Filter.PlatformName != nil && *request.Filter.PlatformName != "" {
				matchPlatformStage := bson.D{
					{"$match", bson.D{
						{"platform_name", request.Filter.PlatformName},
					}},
				}
				pipeline = append(pipeline, matchPlatformStage)
			}

			// Filtering based on chaos_infra scope
			if request.Filter.InfraScope != nil && *request.Filter.InfraScope != "" {
				matchScopeStage := bson.D{
					{"$match", bson.D{
						{"infra_scope", request.Filter.InfraScope},
					}},
				}
				pipeline = append(pipeline, matchScopeStage)
			}

			// Filtering based on description
			if request.Filter.Description != nil && *request.Filter.Description != "" {
				matchDescriptionStage := bson.D{
					{"$match", bson.D{
						{"description", bson.M{
							"$regex": request.Filter.Description, "$options": "mix",
						}},
					}},
				}
				pipeline = append(pipeline, matchDescriptionStage)
			}

			// Filtering based on chaos_infra status
			if request.Filter.IsActive != nil {
				matchInfraStatusStage := bson.D{
					{"$match", bson.D{
						{"is_active", request.Filter.IsActive},
					}},
				}
				pipeline = append(pipeline, matchInfraStatusStage)
			}

			// Filtering based on tags
			if request.Filter.Tags != nil && len(request.Filter.Tags) > 0 {
				matchInfraTagsStage := bson.D{
					{"$match", bson.D{
						{"tags", bson.D{
							{"$all", request.Filter.Tags},
						}},
					}},
				}
				pipeline = append(pipeline, matchInfraTagsStage)
			}
		}

	}

	fetchRunDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosExperimentRuns"},
			{"localField", "infra_id"},
			{"foreignField", "infra_id"},
			{"as", "expRunDetails"},
		}},
	}

	pipeline = append(pipeline, fetchRunDetailsStage)

	addExpRunDetailsFieldsStage := bson.D{
		{"$addFields", bson.D{
			{"expRunDetails", bson.A{
				bson.D{
					{"exp_run_count", bson.D{
						{"$size", "$expRunDetails"},
					}},
					{"last_run_timestamp", bson.D{
						{"$max", "$expRunDetails.updated_at"},
					}},
				},
			}},
		}},
	}

	pipeline = append(pipeline, addExpRunDetailsFieldsStage)

	fetchExperimentDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosExperiments"},
			{"localField", "infra_id"},
			{"foreignField", "infra_id"},
			{"as", "experimentDetails"},
		}},
	}

	pipeline = append(pipeline, fetchExperimentDetailsStage)

	addExpDetailsFieldsStage := bson.D{
		{"$addFields", bson.D{
			{"experimentDetails", bson.A{
				bson.D{
					{"experiments_count", bson.D{
						{"$size", "$experimentDetails"},
					}},
				},
			}},
		}},
	}

	pipeline = append(pipeline, addExpDetailsFieldsStage)

	// Pagination or adding a default limit of 15 if pagination not provided
	_, skip, limit := common.CreatePaginationStage(request.Pagination)

	// Count total project and get top-level document to array
	countStage := bson.D{
		{"$group", bson.D{
			{"_id", nil},
			{"total_filtered_infras", bson.D{{"$sum", 1}}},
			{"infras", bson.D{{"$push", "$$ROOT"}}},
		}},
	}

	// Paging results
	pagingStage := bson.D{
		{"$project", bson.D{
			{"_id", 0},
			{"total_filtered_infras", 1},
			{"infras", bson.D{
				{"$slice", bson.A{"$infras", skip, limit}},
			}},
		}}}

	pipeline = append(pipeline, countStage, pagingStage)

	// Call aggregation on pipeline
	infraCursor, err := in.infraOperator.GetAggregateInfras(pipeline)
	if err != nil {
		return nil, err
	}

	var (
		newInfras []*model.Infra
		infras    []dbChaosInfra.AggregatedInfras
	)

	if err = infraCursor.All(context.Background(), &infras); err != nil || len(infras) == 0 {
		return &model.ListInfraResponse{
			TotalNoOfInfras: 0,
			Infras:          newInfras,
		}, err
	}

	for _, infra := range infras[0].Infras {
		description := infra.Description

		newInfra := model.Infra{
			InfraID:          infra.InfraID,
			ProjectID:        infra.ProjectID,
			Name:             infra.Name,
			EnvironmentID:    infra.EnvironmentID,
			Description:      &description,
			PlatformName:     infra.PlatformName,
			IsActive:         infra.IsActive,
			IsInfraConfirmed: infra.IsInfraConfirmed,
			UpdatedAt:        strconv.FormatInt(infra.UpdatedAt, 10),
			CreatedAt:        strconv.FormatInt(infra.CreatedAt, 10),
			Token:            infra.Token,
			InfraNamespace:   infra.InfraNamespace,
			ServiceAccount:   infra.ServiceAccount,
			InfraScope:       infra.InfraScope,
			StartTime:        infra.StartTime,
			Version:          infra.Version,
			Tags:             infra.Tags,
			IsRemoved:        infra.IsRemoved,
		}

		if len(infra.ExperimentRunDetails) > 0 {
			newInfra.NoOfExperimentRuns = &infra.ExperimentRunDetails[0].TotalRuns
			lastRun := strconv.FormatInt(infra.ExperimentRunDetails[0].LastRunTimestamp, 10)
			newInfra.LastExperimentTimestamp = &lastRun
		}
		if len(infra.ExperimentDetails) > 0 {
			newInfra.NoOfExperiments = &infra.ExperimentDetails[0].TotalSchedules
		}

		newInfra.CreatedBy = &model.UserDetails{Username: infra.CreatedBy.Username}
		newInfra.UpdatedBy = &model.UserDetails{
			Username: infra.UpdatedBy.Username,
		}
		newInfras = append(newInfras, &newInfra)

		//var updateStatus model.UpdateStatus

		// Fetching the list of compatible versions
		//	compatibleVersions := utils.Config.InfraCompatibleVersions
		//
		//	var compatibleArray []string
		//	err = json.Unmarshal([]byte(compatibleVersions), &compatibleArray)
		//	if err != nil {
		//		return nil, err
		//	}
		//
		//	// Storing compatible version in a map
		//	compatibleMap := make(map[int]string)
		//	for _, versionStr := range compatibleArray {
		//		versionInt, err := updateVersionFormat(versionStr)
		//		if err != nil {
		//			return nil, err
		//		}
		//
		//		compatibleMap[versionInt] = versionStr
		//	}
		//
		//	// Fetching the latest version
		//	latestVersion := fetchLatestVersion(compatibleMap)
		//	// converting infra version from DB to int
		//	infraVersion, err := updateVersionFormat(infra.Version)
		//	if err != nil {
		//		return nil, err
		//	}
		//
		//	// Setting the default update status as mandatory
		//	updateStatus = model.UpdateStatusMandatory
		//
		//	// Checking if the infra version is already the latest supported version in the compatibility array
		//	if infraVersion == latestVersion {
		//		updateStatus = model.UpdateStatusNotRequired
		//	} else {
		//		for _, v := range compatibleMap {
		//			if v == infra.Version {
		//				updateStatus = model.UpdateStatusAvailable
		//				break
		//			}
		//		}
		//	}
		//	newInfra.UpdateStatus = updateStatus
	}

	totalFilteredInfrasCounter := 0
	if len(infras) > 0 && infras[0].TotalFilteredInfras > 0 {
		totalFilteredInfrasCounter = infras[0].TotalFilteredInfras
	}

	output := model.ListInfraResponse{
		TotalNoOfInfras: totalFilteredInfrasCounter,
		Infras:          newInfras,
	}
	return &output, nil
}

// GetInfraDetails fetches infra details from the DB
func (in *infraService) GetInfraDetails(ctx context.Context, infraID string, projectID string) (*model.Infra, error) {
	infra, err := in.infraOperator.GetInfraDetails(ctx, infraID, projectID)
	if err != nil {
		return nil, err
	}

	newInfra := model.Infra{}
	err = copier.Copy(&newInfra, &infra)
	if err != nil {
		return nil, err
	}

	return &newInfra, nil
}

func (in *infraService) GetInfraStats(ctx context.Context, projectID string) (*model.GetInfraStatsResponse, error) {

	var pipeline mongo.Pipeline
	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", bson.D{{"$eq", projectID}}},
			{"is_removed", false},
		}},
	}

	// Group by infra status, confirmed stage and count their total number by each group
	groupByStage := bson.D{
		{"$group", bson.D{
			{"_id", nil},

			// Count for active status
			{"total_active_infras", bson.D{
				{"$sum", bson.D{
					{"$cond", bson.A{
						bson.D{{"$eq", bson.A{"$is_active", true}}}, 1, 0}},
				}},
			}},
			{"total_not_active_infras", bson.D{
				{"$sum", bson.D{
					{"$cond", bson.A{
						bson.D{{"$eq", bson.A{"$is_active", false}}}, 1, 0}},
				}},
			}},

			// Count for confirmed status
			{"total_confirmed_infras", bson.D{
				{"$sum", bson.D{
					{"$cond", bson.A{
						bson.D{{"$eq", bson.A{"$is_infra_confirmed", true}}}, 1, 0}},
				}},
			}},

			{"total_not_confirmed_infras", bson.D{
				{"$sum", bson.D{
					{"$cond", bson.A{
						bson.D{{"$eq", bson.A{"$is_infra_confirmed", true}}}, 1, 0}},
				}},
			}},
		}},
	}

	pipeline = append(pipeline, matchIdentifierStage, groupByStage)

	// Call aggregation on pipeline
	infraCursor, err := in.infraOperator.GetAggregateInfras(pipeline)
	if err != nil {
		return nil, err
	}

	var res []dbChaosInfra.AggregatedInfraStats
	if err = infraCursor.All(ctx, &res); err != nil || len(res) == 0 {
		return nil, err
	}

	return &model.GetInfraStatsResponse{
		TotalInfrastructures:             res[0].TotalActiveInfrastructure + res[0].TotalNotActiveInfrastructure,
		TotalActiveInfrastructure:        res[0].TotalActiveInfrastructure,
		TotalInactiveInfrastructures:     res[0].TotalNotActiveInfrastructure,
		TotalConfirmedInfrastructure:     res[0].TotalConfirmedInfrastructures,
		TotalNonConfirmedInfrastructures: res[0].TotalNotConfirmedInfrastructures,
	}, nil

}

// GetVersionDetails returns the compatible infra versions and the latest infra version supported for the current control plane version
func (in *infraService) GetVersionDetails() (*model.InfraVersionDetails, error) {
	// Fetching the list of infra compatible versions
	compatibleVersions := utils.Config.InfraCompatibleVersions

	var compatibleArray []string
	_ = json.Unmarshal([]byte(compatibleVersions), &compatibleArray)

	// To find the latest compatible version
	compatibleMap := make(map[int]string)

	// To store the compatible versions in int format
	var compatibleArrayInt []int

	for _, versionStr := range compatibleArray {
		versionInt, err := updateVersionFormat(versionStr)
		if err != nil {
			return &model.InfraVersionDetails{}, err
		}

		compatibleArrayInt = append(compatibleArrayInt, versionInt)
		compatibleMap[versionInt] = versionStr
	}

	// Fetching the latest version
	latestVersion := fetchLatestVersion(compatibleMap)
	return &model.InfraVersionDetails{LatestVersion: compatibleMap[latestVersion], CompatibleVersions: compatibleArray}, nil
}

// fetchLatestVersion returns the latest version available
func fetchLatestVersion(versions map[int]string) int {
	var latestVersion int
	for k := range versions {
		if k > latestVersion {
			latestVersion = k
		}
	}
	return latestVersion
}

// updateVersionFormat converts string array to int by removing decimal points, 1.0.0 will be returned as 100, 0.1.0 will be returned as 10, 0.0.1 will be returned as 1
func updateVersionFormat(str string) (int, error) {
	if str == CIVersion {
		return 0, nil
	}
	var versionInt int
	versionSlice := strings.Split(str, ".")
	for i, val := range versionSlice {
		x, err := strconv.Atoi(val)
		if err != nil {
			return -1, err
		}
		versionInt += x * int(math.Pow(10, float64(2-i)))
	}
	return versionInt, nil
}

// QueryServerVersion is used to fetch the version of the server
func (in *infraService) QueryServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	dbVersion, err := config.GetConfig(ctx, "version")
	if err != nil {
		return nil, err
	}
	return &model.ServerVersionResponse{
		Key:   dbVersion.Key,
		Value: dbVersion.Value.(string),
	}, nil
}

// PodLog receives logs from the workflow-agent and publishes to frontend clients
func (in *infraService) PodLog(request model.PodLog, r store.StateData) (string, error) {
	_, err := in.VerifyInfra(*request.InfraID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	if reqChan, ok := r.ExperimentLog[request.RequestID]; ok {
		resp := model.PodLogResponse{
			PodName:         request.PodName,
			ExperimentRunID: request.ExperimentRunID,
			PodType:         request.PodType,
			Log:             request.Log,
		}
		reqChan <- &resp
		close(reqChan)
		return "LOGS SENT SUCCESSFULLY", nil
	}
	return "LOG REQUEST CANCELLED", nil
}

// KubeObj receives Kubernetes Object data from subscriber
func (in *infraService) KubeObj(request model.KubeObjectData, r store.StateData) (string, error) {
	_, err := in.VerifyInfra(*request.InfraID)
	if err != nil {
		log.Print("Error", err)
		return "", err
	}
	if reqChan, ok := r.KubeObjectData[request.RequestID]; ok {
		var kubeObjData *model.KubeObject
		err = json.Unmarshal([]byte(request.KubeObj), &kubeObjData)
		if err != nil {
			return "", fmt.Errorf("failed to unmarshal kubeObj data %w", err)
		}

		resp := model.KubeObjectResponse{
			InfraID: request.InfraID.InfraID,
			KubeObj: kubeObjData,
		}
		reqChan <- &resp
		close(reqChan)
		return "KubeData sent successfully", nil
	}
	return "KubeData sent successfully", nil
}

// KubeNamespace receives Kubernetes Namespace data from subscriber
func (in *infraService) KubeNamespace(request model.KubeNamespaceData, r store.StateData) (string, error) {
	_, err := in.VerifyInfra(*request.InfraID)
	if err != nil {
		log.Print("Error", err)
		return "", err
	}
	if reqChan, ok := r.KubeNamespaceData[request.RequestID]; ok {
		var kubeNamespaceData []*model.KubeNamespace
		err = json.Unmarshal([]byte(request.KubeNamespace), &kubeNamespaceData)
		if err != nil {
			return "", fmt.Errorf("failed to unmarshal kubeNamespace data %w", err)
		}

		resp := model.KubeNamespaceResponse{
			InfraID:       request.InfraID.InfraID,
			KubeNamespace: kubeNamespaceData,
		}
		reqChan <- &resp
		close(reqChan)
		return "KubeData sent successfully", nil
	}
	return "KubeData sent successfully", nil
}

// SendInfraEvent sends events from the infras to the appropriate users listening for the events
func (in *infraService) SendInfraEvent(eventType, eventName, description string, infra model.Infra, r store.StateData) {
	newEvent := model.InfraEventResponse{
		EventID:     uuid.New().String(),
		EventType:   eventType,
		EventName:   eventName,
		Description: description,
		Infra:       &infra,
	}
	r.Mutex.Lock()
	if r.InfraEventPublish != nil {
		for _, observer := range r.InfraEventPublish[infra.ProjectID] {
			observer <- &newEvent
		}
	}
	r.Mutex.Unlock()
}

// ConfirmInfraRegistration takes the cluster_id and access_key from the subscriber and validates it, if validated generates and sends new access_key
func (in *infraService) ConfirmInfraRegistration(request model.InfraIdentity, r store.StateData) (*model.ConfirmInfraRegistrationResponse, error) {
	currentVersion := utils.Config.Version
	if currentVersion != request.Version {
		return nil, fmt.Errorf("ERROR: INFRA VERSION MISMATCH (need %v got %v)", currentVersion, request.Version)
	}

	infra, err := in.infraOperator.GetInfra(request.InfraID)
	if err != nil {
		return &model.ConfirmInfraRegistrationResponse{IsInfraConfirmed: false}, err
	}

	if infra.AccessKey == request.AccessKey {
		newKey, err := utils.GenerateAccessKey(32)
		if err != nil {
			return &model.ConfirmInfraRegistrationResponse{IsInfraConfirmed: false}, err
		}
		time := time.Now().UnixMilli()
		query := bson.D{{"infra_id", request.InfraID}}
		update := bson.D{{"$unset", bson.D{{"token", ""}}}, {"$set", bson.D{{"access_key", newKey}, {"is_registered", true}, {"is_infra_confirmed", true}, {"updated_at", time}}}}

		err = in.infraOperator.UpdateInfra(context.TODO(), query, update)
		if err != nil {
			return &model.ConfirmInfraRegistrationResponse{IsInfraConfirmed: false}, err
		}

		infra.IsRegistered = true
		infra.AccessKey = ""

		newInfra := model.Infra{}
		copier.Copy(&newInfra, &infra)

		log.Print("Infra Confirmed having ID: ", infra.InfraID, ", PID: ", infra.ProjectID)

		in.SendInfraEvent("infra-registration", "New Infra", "New Infra registration", newInfra, r)

		return &model.ConfirmInfraRegistrationResponse{IsInfraConfirmed: true, NewAccessKey: &newKey, InfraID: &infra.InfraID}, err
	}
	return &model.ConfirmInfraRegistrationResponse{IsInfraConfirmed: false}, err
}

// VerifyInfra function used to verify infra identity
func (in *infraService) VerifyInfra(identity model.InfraIdentity) (*dbChaosInfra.ChaosInfra, error) {
	currentVersion := utils.Config.Version
	if strings.Contains(strings.ToLower(currentVersion), CIVersion) {
		if currentVersion != identity.Version {
			return nil, fmt.Errorf("ERROR: infra VERSION MISMATCH (need %v got %v)", currentVersion, identity.Version)
		}
	} else {
		splitCPVersion := strings.Split(currentVersion, ".")
		splitSubVersion := strings.Split(identity.Version, ".")
		if len(splitSubVersion) != 3 || splitSubVersion[0] != splitCPVersion[0] {
			return nil, fmt.Errorf("ERROR: infra VERSION MISMATCH (need %v.x.x got %v)", splitCPVersion[0], identity.Version)
		}
	}
	infra, err := in.infraOperator.GetInfra(identity.InfraID)
	if err != nil {
		return nil, err
	}
	if !(infra.AccessKey == identity.AccessKey && infra.IsRegistered) {
		return nil, fmt.Errorf("ERROR:  accessID MISMATCH")
	}
	return &infra, nil
}

// GetManifestWithInfraID returns manifest for a given infra
func (in *infraService) GetManifestWithInfraID(host string, infraID string, accessKey string) ([]byte, error) {
	reqinfra, err := in.infraOperator.GetInfra(infraID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the infra %v", err)
	}

	// Checking if infra with given infraID and accesskey is present
	if reqinfra.AccessKey != accessKey {
		return nil, fmt.Errorf("ACCESS_KEY is invalid")
	}

	var configurations SubscriberConfigurations
	configurations.ServerEndpoint, err = GetEndpoint(host)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	configurations.TLSCert = utils.Config.TlsCertB64

	var respData []byte
	if reqinfra.InfraScope == ClusterScope {
		respData, err = ManifestParser(reqinfra, "manifests/cluster", &configurations)
	} else if reqinfra.InfraScope == NamespaceScope {
		respData, err = ManifestParser(reqinfra, "manifests/namespace", &configurations)
	} else {
		logrus.Error("INFRA_SCOPE env is empty")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse the manifest %v", err)
	}

	return respData, nil
}

// UpdateInfra updates the cluster details
func (c *infraService) UpdateInfra(query bson.D, update bson.D) error {
	return c.infraOperator.UpdateInfra(context.TODO(), query, update)
}

// GetDBInfra returns cluster details for a given clusterID
func (c *infraService) GetDBInfra(infraID string) (dbChaosInfra.ChaosInfra, error) {
	return c.infraOperator.GetInfra(infraID)
}
