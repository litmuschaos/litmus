package probe

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	argoTypes "github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
)

func addHTTPProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {

	newProbe.HTTPProperties = &dbSchemaProbe.HTTPProbe{
		// Common Probe Properties
		ProbeTimeout:      request.HTTPProperties.ProbeTimeout,
		Interval:          request.HTTPProperties.Interval,
		EvaluationTimeout: request.HTTPProperties.EvaluationTimeout,
		// Unique Properties for HTTP Probe
		URL:    request.HTTPProperties.URL,
		Method: dbSchemaProbe.Method{},
	}
	// HTTP Probe -> Attempt
	newProbe.HTTPProperties.Attempt = request.HTTPProperties.Attempt

	// HTTP Probe -> Retry
	newProbe.HTTPProperties.Retry = request.HTTPProperties.Retry

	// HTTP Probe -> ProbePollingInterval
	newProbe.HTTPProperties.PollingInterval = request.HTTPProperties.ProbePollingInterval

	// HTTP Probe -> EvaluationTimeout
	newProbe.HTTPProperties.EvaluationTimeout = request.HTTPProperties.EvaluationTimeout

	// HTTP Probe -> InitialDelay
	newProbe.HTTPProperties.InitialDelay = request.HTTPProperties.InitialDelay

	// HTTP Probe -> StopOnFailureEnabled
	newProbe.HTTPProperties.StopOnFailure = request.HTTPProperties.StopOnFailure

	// HTTP Probe -> InsecureSkipVerify
	newProbe.HTTPProperties.InsecureSkipVerify = request.HTTPProperties.InsecureSkipVerify

	// HTTP Probe -> Method [GET or POST]
	if request.HTTPProperties.Method.Get != nil {
		newProbe.HTTPProperties.Method.GET = &dbSchemaProbe.GET{
			Criteria:     request.HTTPProperties.Method.Get.Criteria,
			ResponseCode: request.HTTPProperties.Method.Get.ResponseCode,
		}
	} else if request.HTTPProperties.Method.Post != nil {
		newProbe.HTTPProperties.Method.POST = &dbSchemaProbe.POST{
			Criteria:     request.HTTPProperties.Method.Post.Criteria,
			ResponseCode: request.HTTPProperties.Method.Post.ResponseCode,
		}

		newProbe.HTTPProperties.Method.POST.ContentType = request.HTTPProperties.Method.Post.ContentType

		newProbe.HTTPProperties.Method.POST.Body = request.HTTPProperties.Method.Post.Body

		newProbe.HTTPProperties.Method.POST.BodyPath = request.HTTPProperties.Method.Post.BodyPath

	}

	return newProbe
}

func addCMDProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
	newProbe.CMDProperties = &dbSchemaProbe.CMDProbe{
		// Common Probe Properties
		ProbeTimeout: request.CmdProperties.ProbeTimeout,
		Interval:     request.CmdProperties.Interval,
		// Unique Properties for CMD Probe
		Command: request.CmdProperties.Command,
		Comparator: dbSchemaProbe.Comparator{
			Type:     request.CmdProperties.Comparator.Type,
			Value:    request.CmdProperties.Comparator.Value,
			Criteria: request.CmdProperties.Comparator.Criteria,
		},
	}
	// CMD Probe -> Attempt
	newProbe.CMDProperties.Attempt = request.CmdProperties.Attempt

	// CMD Probe -> Retry
	newProbe.CMDProperties.Retry = request.CmdProperties.Retry

	// CMD Probe -> ProbePollingInterval
	newProbe.CMDProperties.PollingInterval = request.CmdProperties.ProbePollingInterval

	// CMD Probe -> EvaluationTimeout
	newProbe.CMDProperties.EvaluationTimeout = request.CmdProperties.EvaluationTimeout

	// CMD Probe -> InitialDelaySeconds
	newProbe.CMDProperties.InitialDelay = request.CmdProperties.InitialDelay

	// CMD Probe -> StopOnFailureEnabled
	newProbe.CMDProperties.StopOnFailure = request.CmdProperties.StopOnFailure

	// CMD Probe -> Source
	if request.CmdProperties.Source != nil {
		var source *v1alpha1.SourceDetails
		err := json.Unmarshal([]byte(*request.CmdProperties.Source), &source)
		if err != nil {
			return nil
		}
		newProbe.CMDProperties.Source = &v1alpha1.SourceDetails{
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

	return newProbe
}

func addPROMProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
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
	newProbe.PROMProperties.Query = *request.PromProperties.Query

	// PROM Probe -> Query Path
	newProbe.PROMProperties.QueryPath = request.PromProperties.QueryPath

	return newProbe
}

func addK8SProbeProperties(newProbe *dbSchemaProbe.Probe, request model.ProbeRequest) *dbSchemaProbe.Probe {
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

		httpProbeURL := probe.HTTPProperties.URL
		var _probe HTTPProbeAttributes

		_probe.Name = probe.Name
		_probe.Type = string(probe.Type)
		_probe.Mode = string(mode)

		if probe.HTTPProperties.InsecureSkipVerify != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				InsecureSkipVerify: *probe.HTTPProperties.InsecureSkipVerify,
			}

		}

		if probe.HTTPProperties.Method.Get != nil {

			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				URL: httpProbeURL,
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     probe.HTTPProperties.Method.Get.Criteria,
						ResponseCode: probe.HTTPProperties.Method.Get.ResponseCode,
					},
				},
			}
		} else if probe.HTTPProperties.Method.Post != nil {
			_probe.HTTPProbeInputs = v1alpha1.HTTPProbeInputs{
				URL: httpProbeURL,
				Method: v1alpha1.HTTPMethod{
					Post: &v1alpha1.PostMethod{
						Criteria:     probe.HTTPProperties.Method.Post.Criteria,
						ResponseCode: probe.HTTPProperties.Method.Post.ResponseCode,
					},
				},
			}

			if probe.HTTPProperties.Method.Post.ContentType != nil {
				_probe.HTTPProbeInputs.Method.Post.ContentType = *probe.HTTPProperties.Method.Post.ContentType
			}

			if probe.HTTPProperties.Method.Post.Body != nil {
				_probe.HTTPProbeInputs.Method.Post.Body = *probe.HTTPProperties.Method.Post.Body
			}

			if probe.HTTPProperties.Method.Post.BodyPath != nil {
				_probe.HTTPProbeInputs.Method.Post.BodyPath = *probe.HTTPProperties.Method.Post.BodyPath
			}
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.HTTPProperties.ProbeTimeout,
			Interval:     probe.HTTPProperties.Interval,
		}

		if probe.HTTPProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.HTTPProperties.Attempt
		}

		if probe.HTTPProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.HTTPProperties.Retry
		}

		if probe.HTTPProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.HTTPProperties.ProbePollingInterval
		}

		if probe.HTTPProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.HTTPProperties.EvaluationTimeout
		}

		if probe.HTTPProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.HTTPProperties.StopOnFailure
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
			Command: probe.CmdProperties.Command,
			Comparator: v1alpha1.ComparatorInfo{
				Type:     probe.CmdProperties.Comparator.Type,
				Criteria: probe.CmdProperties.Comparator.Criteria,
				Value:    probe.CmdProperties.Comparator.Value,
			},
		}

		_probe.RunProperties = v1alpha1.RunProperty{
			ProbeTimeout: probe.CmdProperties.ProbeTimeout,
			Interval:     probe.CmdProperties.Interval,
		}

		if probe.CmdProperties.Attempt != nil {
			_probe.RunProperties.Attempt = *probe.CmdProperties.Attempt
		}

		if probe.CmdProperties.Retry != nil {
			_probe.RunProperties.Retry = *probe.CmdProperties.Retry
		}

		if probe.CmdProperties.ProbePollingInterval != nil {
			_probe.RunProperties.ProbePollingInterval = *probe.CmdProperties.ProbePollingInterval
		}

		if probe.CmdProperties.EvaluationTimeout != nil {
			_probe.RunProperties.EvaluationTimeout = *probe.CmdProperties.EvaluationTimeout
		}

		if probe.CmdProperties.InitialDelay != nil {
			_probe.RunProperties.InitialDelay = *probe.CmdProperties.InitialDelay
		}

		if probe.CmdProperties.StopOnFailure != nil {
			_probe.RunProperties.StopOnFailure = *probe.CmdProperties.StopOnFailure
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
				var data = artifact[0].Raw.Data
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
							artifact[0].Name,
							annotationArray,
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
				var data = artifact[0].Raw.Data
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
							artifact[0].Name,
							annotationArray,
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
		probes            []v1alpha1.ProbeAttributes
		backgroundContext = context.Background()
		nonCronManifest   argoTypes.Workflow
		httpProbe         HTTPProbeAttributes
		cmdProbe          CMDProbeAttributes
		promProbe         PROMProbeAttributes
		k8sProbe          K8SProbeAttributes
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
			var data = artifact[0].Raw.Data
			if len(data) > 0 {
				var (
					meta       v1alpha1.ChaosEngine
					annotation = make(map[string]string)
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
											Method:             v1alpha1.HTTPMethod(httpProbe.HTTPProbeInputs.Method),
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
		probes            []v1alpha1.ProbeAttributes
		backgroundContext = context.Background()
		cronManifest      argoTypes.CronWorkflow
		httpProbe         HTTPProbeAttributes
		cmdProbe          CMDProbeAttributes
		promProbe         PROMProbeAttributes
		k8sProbe          K8SProbeAttributes
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
			var data = artifact[0].Raw.Data
			if len(data) > 0 {
				var (
					meta       v1alpha1.ChaosEngine
					annotation = make(map[string]string)
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
										Method:             v1alpha1.HTTPMethod(httpProbe.HTTPProbeInputs.Method),
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
