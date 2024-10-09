package utils

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

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

func AddKubernetesCMDProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
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
			log.Errorf("error unmarshalling soruce: %s", err.Error())
			return nil
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

	return newProbe
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

// GenerateProbeManifest - Generates the types and returns a marshalled probe attribute configuration
func GenerateProbeManifest(probe *model.Probe, mode model.Mode) (string, error) {
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
			_ = json.Unmarshal([]byte(*probe.KubernetesCMDProperties.Source), &source)
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

// GenerateExperimentManifestWithProbes - uses GenerateProbeManifest to get and store the respective probe attribute into Raw Data template for Non Cron Workflow
func GenerateExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.Workflow, error) {
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
								probe, err := dbSchemaProbe.GetProbeByName(ctx, annotationKey.Name, projectID)
								if err != nil {
									return argoTypes.Workflow{}, fmt.Errorf("failed to fetch probe details, error: %s", err.Error())
								}
								probeManifestString, err := GenerateProbeManifest(probe.GetOutputProbe(), annotationKey.Mode)
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
func GenerateCronExperimentManifestWithProbes(manifest string, projectID string) (argoTypes.CronWorkflow, error) {
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
							probe, err := dbSchemaProbe.GetProbeByName(ctx, annotationKey.Name, projectID)
							if err != nil {
								return argoTypes.CronWorkflow{}, fmt.Errorf("failed to fetch probe details, error: %s", err.Error())
							}

							probeManifestString, err := GenerateProbeManifest(probe.GetOutputProbe(), annotationKey.Mode)

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
