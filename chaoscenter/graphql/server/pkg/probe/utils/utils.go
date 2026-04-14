package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	argoTypes "github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/ghodss/yaml"
	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	log "github.com/sirupsen/logrus"
)

func AddKubernetesHTTPProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
	newProbe.KubernetesHTTPProperties = &dbSchemaProbe.KubernetesHTTPProbe{
		// Common Probe Properties
		ProbeTimeout:      request.KubernetesHTTPProperties.ProbeTimeout,
		Interval:          request.KubernetesHTTPProperties.Interval,
		EvaluationTimeout: request.KubernetesHTTPProperties.EvaluationTimeout,
		// Unique Properties for HTTP Probe
		URL:    request.KubernetesHTTPProperties.URL,
		Method: dbSchemaProbe.Method{},
	}
	// HTTP Probe -> Attempt
	newProbe.KubernetesHTTPProperties.Attempt = request.KubernetesHTTPProperties.Attempt

	// HTTP Probe -> Retry
	newProbe.KubernetesHTTPProperties.Retry = request.KubernetesHTTPProperties.Retry

	// HTTP Probe -> ProbePollingInterval
	newProbe.KubernetesHTTPProperties.PollingInterval = request.KubernetesHTTPProperties.ProbePollingInterval

	// HTTP Probe -> EvaluationTimeout
	newProbe.KubernetesHTTPProperties.EvaluationTimeout = request.KubernetesHTTPProperties.EvaluationTimeout

	// HTTP Probe -> InitialDelay
	newProbe.KubernetesHTTPProperties.InitialDelay = request.KubernetesHTTPProperties.InitialDelay

	// HTTP Probe -> StopOnFailureEnabled
	newProbe.KubernetesHTTPProperties.StopOnFailure = request.KubernetesHTTPProperties.StopOnFailure

	// HTTP Probe -> InsecureSkipVerify
	newProbe.KubernetesHTTPProperties.InsecureSkipVerify = request.KubernetesHTTPProperties.InsecureSkipVerify

	// HTTP Probe -> Method [GET or POST]
	if request.KubernetesHTTPProperties.Method.Get != nil {
		newProbe.KubernetesHTTPProperties.Method.GET = &dbSchemaProbe.GET{
			Criteria:     request.KubernetesHTTPProperties.Method.Get.Criteria,
			ResponseCode: request.KubernetesHTTPProperties.Method.Get.ResponseCode,
		}
	} else if request.KubernetesHTTPProperties.Method.Post != nil {
		newProbe.KubernetesHTTPProperties.Method.POST = &dbSchemaProbe.POST{
			Criteria:     request.KubernetesHTTPProperties.Method.Post.Criteria,
			ResponseCode: request.KubernetesHTTPProperties.Method.Post.ResponseCode,
		}

		newProbe.KubernetesHTTPProperties.Method.POST.ContentType = request.KubernetesHTTPProperties.Method.Post.ContentType

		newProbe.KubernetesHTTPProperties.Method.POST.Body = request.KubernetesHTTPProperties.Method.Post.Body

		newProbe.KubernetesHTTPProperties.Method.POST.BodyPath = request.KubernetesHTTPProperties.Method.Post.BodyPath

	}

	return newProbe
}

func AddKubernetesCMDProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) (*dbSchemaProbe.Probe, error) {
	newProbe.KubernetesCMDProperties = &dbSchemaProbe.KubernetesCMDProbe{
		// Common Probe Properties
		ProbeTimeout: request.KubernetesCMDProperties.ProbeTimeout,
		Interval:     request.KubernetesCMDProperties.Interval,
		// Unique Properties for CMD Probe
		Command: request.KubernetesCMDProperties.Command,
		Comparator: dbSchemaProbe.Comparator{
			Type:     request.KubernetesCMDProperties.Comparator.Type,
			Value:    request.KubernetesCMDProperties.Comparator.Value,
			Criteria: request.KubernetesCMDProperties.Comparator.Criteria,
		},
	}
	// CMD Probe -> Attempt
	newProbe.KubernetesCMDProperties.Attempt = request.KubernetesCMDProperties.Attempt

	// CMD Probe -> Retry
	newProbe.KubernetesCMDProperties.Retry = request.KubernetesCMDProperties.Retry

	// CMD Probe -> ProbePollingInterval
	newProbe.KubernetesCMDProperties.PollingInterval = request.KubernetesCMDProperties.ProbePollingInterval

	// CMD Probe -> EvaluationTimeout
	newProbe.KubernetesCMDProperties.EvaluationTimeout = request.KubernetesCMDProperties.EvaluationTimeout

	// CMD Probe -> InitialDelaySeconds
	newProbe.KubernetesCMDProperties.InitialDelay = request.KubernetesCMDProperties.InitialDelay

	// CMD Probe -> StopOnFailureEnabled
	newProbe.KubernetesCMDProperties.StopOnFailure = request.KubernetesCMDProperties.StopOnFailure

	// CMD Probe -> Source
	if request.KubernetesCMDProperties.Source != nil {
		var source *v1alpha1.SourceDetails

		err := json.Unmarshal([]byte(*request.KubernetesCMDProperties.Source), &source)
		if err != nil {
			log.Errorf("error unmarshalling source: %s", err.Error())
			return nil, err
		}
		if source != nil {
			newProbe.KubernetesCMDProperties.Source = &v1alpha1.SourceDetails{
				Image:            source.Image,
				HostNetwork:      source.HostNetwork,
				InheritInputs:    source.InheritInputs,
				Args:             source.Args,
				ENVList:          source.ENVList,
				Labels:           source.Labels,
				Annotations:      source.Annotations,
				Command:          source.Command,
				ImagePullPolicy:  source.ImagePullPolicy,
				Privileged:       source.Privileged,
				NodeSelector:     source.NodeSelector,
				Volumes:          source.Volumes,
				VolumesMount:     source.VolumesMount,
				ImagePullSecrets: source.ImagePullSecrets,
			}
		}
	}

	return newProbe, nil
}

func AddPROMProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
	newProbe.PROMProperties = &dbSchemaProbe.PROMProbe{
		// Common Probe Properties
		ProbeTimeout: request.PromProperties.ProbeTimeout,
		Interval:     request.PromProperties.Interval,
		// Unique Properties for PROM Probe
		Endpoint: request.PromProperties.Endpoint,
		Comparator: dbSchemaProbe.Comparator{
			Type:     request.PromProperties.Comparator.Type,
			Value:    request.PromProperties.Comparator.Value,
			Criteria: request.PromProperties.Comparator.Criteria,
		},
	}
	// PROM Probe -> Attempt
	newProbe.PROMProperties.Attempt = request.PromProperties.Attempt

	// PROM Probe -> Retry
	newProbe.PROMProperties.Retry = request.PromProperties.Retry

	// PROM Probe -> ProbePollingInterval
	newProbe.PROMProperties.PollingInterval = request.PromProperties.ProbePollingInterval

	// PROM Probe -> EvaluationTimeout
	newProbe.PROMProperties.EvaluationTimeout = request.PromProperties.EvaluationTimeout

	// PROM Probe -> InitialDelaySeconds
	newProbe.PROMProperties.InitialDelay = request.PromProperties.InitialDelay

	// PROM Probe -> StopOnFailureEnabled
	newProbe.PROMProperties.StopOnFailure = request.PromProperties.StopOnFailure

	// PROM Probe -> Query
	newProbe.PROMProperties.Query = request.PromProperties.Query

	// PROM Probe -> Query Path
	newProbe.PROMProperties.QueryPath = request.PromProperties.QueryPath

	return newProbe
}

func AddK8SProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
	newProbe.K8SProperties = &dbSchemaProbe.K8SProbe{
		// Common Probe Properties
		ProbeTimeout: request.K8sProperties.ProbeTimeout,
		Interval:     request.K8sProperties.Interval,
		// Unique Properties for K8S Probe
		Version:   request.K8sProperties.Version,
		Resource:  request.K8sProperties.Resource,
		Operation: request.K8sProperties.Operation,
	}

	// PROM Probe -> Attempt
	newProbe.K8SProperties.Attempt = request.K8sProperties.Attempt

	// PROM Probe -> Retry
	newProbe.K8SProperties.Retry = request.K8sProperties.Retry

	// PROM Probe -> ProbePollingInterval
	newProbe.K8SProperties.PollingInterval = request.K8sProperties.ProbePollingInterval

	// PROM Probe -> EvaluationTimeout
	newProbe.K8SProperties.EvaluationTimeout = request.K8sProperties.EvaluationTimeout

	// K8S Probe -> StopOnFailureEnabled
	newProbe.K8SProperties.StopOnFailure = request.K8sProperties.StopOnFailure

	// K8S Probe -> Group
	newProbe.K8SProperties.Group = request.K8sProperties.Group

	// K8S Probe -> ResourceNames
	newProbe.K8SProperties.ResourceNames = request.K8sProperties.ResourceNames

	// K8S Probe -> Namespace
	newProbe.K8SProperties.Namespace = request.K8sProperties.Namespace

	// K8S Probe -> Field Selector
	newProbe.K8SProperties.FieldSelector = request.K8sProperties.FieldSelector

	// K8S Probe -> Label Selector
	newProbe.K8SProperties.LabelSelector = request.K8sProperties.LabelSelector

	return newProbe
}

// ParseProbesFromManifest - Parses the manifest to return probes which is stored in the DB
func ParseProbesFromManifest(wfType *dbChaosExperiment.ChaosExperimentType, manifest string) ([]dbChaosExperiment.Probes, error) {
	var (
		probes          []dbChaosExperiment.Probes
		nonCronManifest argoTypes.Workflow
		cronManifest    argoTypes.CronWorkflow
	)

	if *wfType == "cronexperiment" {
		err := json.Unmarshal([]byte(manifest), &cronManifest)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal experiment manifest, error: %s", err.Error())
		}

		for _, template := range cronManifest.Spec.WorkflowSpec.Templates {
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
					)

					err := yaml.Unmarshal([]byte(data), &meta)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal chaosengine, error: %s", err.Error())
					}
					if strings.ToLower(meta.Kind) == "chaosengine" {
						if meta.Annotations != nil {
							annotation = meta.Annotations
						}
						var annotationArray []string
						for _, key := range annotation {

							var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
							err := json.Unmarshal([]byte(key), &manifestAnnotation)
							if err != nil {
								return nil, fmt.Errorf("failed to unmarshal experiment annotation object, error: %s", err.Error())
							}
							for _, annotationKey := range manifestAnnotation {
								annotationArray = append(annotationArray, annotationKey.Name)
							}
						}
						probes = append(probes, dbChaosExperiment.Probes{
							FaultName:  artifact[0].Name,
							ProbeNames: annotationArray,
						})
					}
				}
			}
		}
	} else {
		err := json.Unmarshal([]byte(manifest), &nonCronManifest)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal experiment manifest, error: %s", err.Error())
		}

		for _, template := range nonCronManifest.Spec.Templates {
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
					)

					err := yaml.Unmarshal([]byte(data), &meta)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal chaosengine, error: %s", err.Error())
					}
					if strings.ToLower(meta.Kind) == "chaosengine" {
						if meta.Annotations != nil {
							annotation = meta.Annotations
						}
						var annotationArray []string
						for _, key := range annotation {

							var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
							err := json.Unmarshal([]byte(key), &manifestAnnotation)
							if err != nil {
								return nil, fmt.Errorf("failed to unmarshal experiment annotation object, error: %s", err.Error())
							}
							for _, annotationKey := range manifestAnnotation {
								annotationArray = append(annotationArray, annotationKey.Name)
							}
						}
						probes = append(probes, dbChaosExperiment.Probes{
							FaultName:  artifact[0].Name,
							ProbeNames: annotationArray,
						})
					}
				}
			}
		}
	}

	return probes, nil
}

// ParseProbesFromManifestForRuns - Parses the manifest to return probes which is stored in the DB
func ParseProbesFromManifestForRuns(wfType *dbChaosExperiment.ChaosExperimentType, manifest string) ([]dbChaosExperimentRun.Probes, error) {
	var (
		probes          []dbChaosExperimentRun.Probes
		nonCronManifest argoTypes.Workflow
		cronManifest    argoTypes.CronWorkflow
	)

	if *wfType == "cronexperiment" {
		err := json.Unmarshal([]byte(manifest), &cronManifest)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal experiment manifest, error: %v", err.Error())
		}

		for _, template := range cronManifest.Spec.WorkflowSpec.Templates {
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
					)

					err := yaml.Unmarshal([]byte(data), &meta)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal chaosengine, error: %v", err.Error())
					}
					if strings.ToLower(meta.Kind) == "chaosengine" {
						if meta.Annotations != nil {
							annotation = meta.Annotations
						}
						var annotationArray []string
						for _, key := range annotation {

							var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
							err := json.Unmarshal([]byte(key), &manifestAnnotation)
							if err != nil {
								return nil, fmt.Errorf("failed to unmarshal experiment annotation object, error: %v", err.Error())
							}
							for _, annotationKey := range manifestAnnotation {
								annotationArray = append(annotationArray, annotationKey.Name)
							}
						}
						probes = append(probes, dbChaosExperimentRun.Probes{
							FaultName:  artifact[0].Name,
							ProbeNames: annotationArray,
						})
					}
				}
			}
		}
	} else {
		err := json.Unmarshal([]byte(manifest), &nonCronManifest)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal experiment manifest, error: %v", err.Error())
		}

		for _, template := range nonCronManifest.Spec.Templates {
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
					)

					err := yaml.Unmarshal([]byte(data), &meta)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal chaosengine, error: %v", err.Error())
					}
					if strings.ToLower(meta.Kind) == "chaosengine" {
						if meta.Annotations != nil {
							annotation = meta.Annotations
						}
						var annotationArray []string
						for _, key := range annotation {

							var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
							err := json.Unmarshal([]byte(key), &manifestAnnotation)
							if err != nil {
								return nil, fmt.Errorf("failed to unmarshal experiment annotation object, error: %v", err.Error())
							}
							for _, annotationKey := range manifestAnnotation {
								annotationArray = append(annotationArray, annotationKey.Name)
							}
						}
						probes = append(probes, dbChaosExperimentRun.Probes{
							FaultName:  artifact[0].Name,
							ProbeNames: annotationArray,
						})
					}
				}
			}
		}
	}

	return probes, nil
}

func InsertProbeRefAnnotation(rawYaml, value string) (string, error) {
	var data interface{}

	err := yaml.Unmarshal([]byte(rawYaml), &data)
	if err != nil {
		return "", err
	}

	dataMap := data.(map[string]interface{})

	metadata := dataMap["metadata"]
	if metadata == nil {
		return "", errors.New("metadata not found")
	}

	annotations := metadata.(map[string]interface{})["annotations"]
	if annotations == nil {
		// create new annotations
		annotations = make(map[string]interface{})
		metadata.(map[string]interface{})["annotations"] = annotations
	}

	annotations.(map[string]interface{})["probeRef"] = value

	result, err := yaml.Marshal(dataMap)
	if err != nil {
		return "", err
	}

	return string(result), nil
}

// ProbeInputsToProbeRequestConverter Convert the probe inputs to probe request
func ProbeInputsToProbeRequestConverter(probeInputs v1alpha1.ProbeAttributes) (model.ProbeRequest, error) {
	var kubernetesHTTPProperties *model.KubernetesHTTPProbeRequest
	var kubernetesCMDProperties *model.KubernetesCMDProbeRequest
	var k8sProperties *model.K8SProbeRequest
	var promProperties *model.PROMProbeRequest

	if probeInputs.RunProperties.ProbeTimeout == "" || probeInputs.RunProperties.Interval == "" {
		return model.ProbeRequest{}, errors.New("values for ProbeTimeout and Interval are required")
	}

	switch model.ProbeType(probeInputs.Type) {
	case model.ProbeTypeHTTPProbe:
		method := &model.MethodRequest{}
		if probeInputs.HTTPProbeInputs.Method.Get != nil {
			method.Get = &model.GETRequest{
				Criteria:     probeInputs.HTTPProbeInputs.Method.Get.Criteria,
				ResponseCode: probeInputs.HTTPProbeInputs.Method.Get.ResponseCode,
			}
		} else if probeInputs.HTTPProbeInputs.Method.Post != nil {
			method.Post = &model.POSTRequest{
				Criteria:     probeInputs.HTTPProbeInputs.Method.Post.Criteria,
				ResponseCode: probeInputs.HTTPProbeInputs.Method.Post.ResponseCode,
			}
			method.Post.ContentType = &probeInputs.HTTPProbeInputs.Method.Post.ContentType
			method.Post.Body = &probeInputs.HTTPProbeInputs.Method.Post.Body
			method.Post.BodyPath = &probeInputs.HTTPProbeInputs.Method.Post.BodyPath
		} else {
			return model.ProbeRequest{}, errors.New("GET/POST method not specified")
		}
		if probeInputs.HTTPProbeInputs.URL == "" {
			return model.ProbeRequest{}, errors.New("URL not specified")
		}
		kubernetesHTTPProperties = &model.KubernetesHTTPProbeRequest{
			ProbeTimeout:       probeInputs.RunProperties.ProbeTimeout,
			Interval:           probeInputs.RunProperties.Interval,
			URL:                probeInputs.HTTPProbeInputs.URL,
			Method:             method,
			Attempt:            &probeInputs.RunProperties.Attempt,
			Retry:              &probeInputs.RunProperties.Retry,
			StopOnFailure:      &probeInputs.RunProperties.StopOnFailure,
			InsecureSkipVerify: &probeInputs.HTTPProbeInputs.InsecureSkipVerify,
		}
		if probeInputs.RunProperties.EvaluationTimeout != "" {
			kubernetesHTTPProperties.EvaluationTimeout = &probeInputs.RunProperties.EvaluationTimeout
		}
		if probeInputs.RunProperties.ProbePollingInterval != "" {
			kubernetesHTTPProperties.ProbePollingInterval = &probeInputs.RunProperties.ProbePollingInterval
		}
		if probeInputs.RunProperties.InitialDelay != "" {
			kubernetesHTTPProperties.InitialDelay = &probeInputs.RunProperties.InitialDelay
		}
	case model.ProbeTypePromProbe:
		if probeInputs.PromProbeInputs.Endpoint == "" {
			return model.ProbeRequest{}, errors.New("endpoint not specified")
		}
		promProperties = &model.PROMProbeRequest{
			ProbeTimeout: probeInputs.RunProperties.ProbeTimeout,
			Interval:     probeInputs.RunProperties.Interval,
			Endpoint:     probeInputs.PromProbeInputs.Endpoint,
			Comparator: &model.ComparatorInput{
				Type:     probeInputs.PromProbeInputs.Comparator.Type,
				Criteria: probeInputs.PromProbeInputs.Comparator.Criteria,
				Value:    probeInputs.PromProbeInputs.Comparator.Value,
			},
			Attempt:              &probeInputs.RunProperties.Attempt,
			Retry:                &probeInputs.RunProperties.Retry,
			ProbePollingInterval: &probeInputs.RunProperties.ProbePollingInterval,
			EvaluationTimeout:    &probeInputs.RunProperties.EvaluationTimeout,
			InitialDelay:         &probeInputs.RunProperties.InitialDelay,
			StopOnFailure:        &probeInputs.RunProperties.StopOnFailure,
			Query:                &probeInputs.PromProbeInputs.Query,
			QueryPath:            &probeInputs.PromProbeInputs.QueryPath,
		}
	case model.ProbeTypeK8sProbe:
		if probeInputs.K8sProbeInputs.Resource == "" || probeInputs.K8sProbeInputs.Operation == "" || probeInputs.K8sProbeInputs.Version == "" {
			return model.ProbeRequest{}, errors.New("resource, operation and version are required")
		}
		k8sProperties = &model.K8SProbeRequest{
			ProbeTimeout:         probeInputs.RunProperties.ProbeTimeout,
			Interval:             probeInputs.RunProperties.Interval,
			Version:              probeInputs.K8sProbeInputs.Version,
			Resource:             probeInputs.K8sProbeInputs.Resource,
			Operation:            probeInputs.K8sProbeInputs.Operation,
			Attempt:              &probeInputs.RunProperties.Attempt,
			Retry:                &probeInputs.RunProperties.Retry,
			ProbePollingInterval: &probeInputs.RunProperties.ProbePollingInterval,
			EvaluationTimeout:    &probeInputs.RunProperties.EvaluationTimeout,
			StopOnFailure:        &probeInputs.RunProperties.StopOnFailure,
			Group:                &probeInputs.K8sProbeInputs.Group,
			ResourceNames:        &probeInputs.K8sProbeInputs.ResourceNames,
			Namespace:            &probeInputs.K8sProbeInputs.Namespace,
			FieldSelector:        &probeInputs.K8sProbeInputs.FieldSelector,
			LabelSelector:        &probeInputs.K8sProbeInputs.LabelSelector,
		}
	case model.ProbeTypeCmdProbe:
		source, _ := json.Marshal(probeInputs.CmdProbeInputs.Source)
		sourcePtr := string(source)
		kubernetesCMDProperties = &model.KubernetesCMDProbeRequest{
			ProbeTimeout: probeInputs.RunProperties.ProbeTimeout,
			Interval:     probeInputs.RunProperties.Interval,
			Command:      probeInputs.CmdProbeInputs.Command,
			Comparator: &model.ComparatorInput{
				Type:     probeInputs.CmdProbeInputs.Comparator.Type,
				Criteria: probeInputs.CmdProbeInputs.Comparator.Criteria,
				Value:    probeInputs.CmdProbeInputs.Comparator.Value,
			},
			Attempt:              &probeInputs.RunProperties.Attempt,
			Retry:                &probeInputs.RunProperties.Retry,
			ProbePollingInterval: &probeInputs.RunProperties.ProbePollingInterval,
			InitialDelay:         &probeInputs.RunProperties.InitialDelay,
			StopOnFailure:        &probeInputs.RunProperties.StopOnFailure,
			Source:               &sourcePtr,
		}
	}

	return model.ProbeRequest{
		Name:                     probeInputs.Name + "-" + utils.GenerateUUID(),
		Type:                     model.ProbeType(probeInputs.Type),
		K8sProperties:            k8sProperties,
		KubernetesHTTPProperties: kubernetesHTTPProperties,
		KubernetesCMDProperties:  kubernetesCMDProperties,
		PromProperties:           promProperties,
		InfrastructureType:       model.InfrastructureTypeKubernetes,
		Tags:                     []string{},
	}, nil
}
