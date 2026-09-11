package gitops

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/tidwall/gjson"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

const (
	probeManifestAPIVersion = "litmuschaos.io/v1alpha1"
	probeManifestKind       = "ResilienceProbe"
)

// probeManifest is the declarative, git-friendly representation of a probe
// (kind ResilienceProbe). Its spec mirrors model.ProbeRequest: `type` and
// `infrastructureType` select the probe kind, and `properties` holds the
// type-specific request struct (KubernetesHTTPProbeRequest,
// KubernetesCMDProbeRequest, PROMProbeRequest or K8SProbeRequest) using the
// same camelCase JSON field names. metadata.labels and metadata.annotations
// are accepted for compatibility with Kubernetes tooling but are not stored.
type probeManifest struct {
	APIVersion string                `json:"apiVersion"`
	Kind       string                `json:"kind"`
	Metadata   probeManifestMetadata `json:"metadata"`
	Spec       probeManifestSpec     `json:"spec"`
}

type probeManifestMetadata struct {
	Name        string            `json:"name"`
	Description *string           `json:"description,omitempty"`
	Tags        []string          `json:"tags,omitempty"`
	Labels      map[string]string `json:"labels,omitempty"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

type probeManifestSpec struct {
	Type               model.ProbeType          `json:"type"`
	InfrastructureType model.InfrastructureType `json:"infrastructureType"`
	Properties         json.RawMessage          `json:"properties"`
}

// isProbeManifestKind reports whether a manifest's kind names a ResilienceProbe.
func isProbeManifestKind(kind string) bool {
	return strings.EqualFold(kind, probeManifestKind)
}

// parseProbeManifest converts a ResilienceProbe manifest (YAML or JSON) into a
// ProbeRequest. Unknown fields are rejected so that typos in a manifest surface
// as sync errors instead of silently dropped configuration.
func parseProbeManifest(data []byte) (*model.ProbeRequest, error) {
	jsonData, err := yaml.YAMLToJSON(data)
	if err != nil {
		return nil, fmt.Errorf("invalid manifest: %w", err)
	}

	var m probeManifest
	if err := strictUnmarshal(jsonData, &m); err != nil {
		return nil, fmt.Errorf("invalid manifest: %w", err)
	}

	if !isProbeManifestKind(m.Kind) {
		return nil, fmt.Errorf("unsupported kind %q, expected %s", m.Kind, probeManifestKind)
	}
	if m.APIVersion != probeManifestAPIVersion {
		return nil, fmt.Errorf("unsupported apiVersion %q, expected %s", m.APIVersion, probeManifestAPIVersion)
	}
	if m.Metadata.Name == "" {
		return nil, errors.New("metadata.name is required")
	}
	if !m.Spec.Type.IsValid() {
		return nil, fmt.Errorf("unsupported spec.type %q", m.Spec.Type)
	}
	if !m.Spec.InfrastructureType.IsValid() {
		return nil, fmt.Errorf("unsupported spec.infrastructureType %q", m.Spec.InfrastructureType)
	}
	if len(m.Spec.Properties) == 0 {
		return nil, errors.New("spec.properties is required")
	}

	req := &model.ProbeRequest{
		Name:               m.Metadata.Name,
		Description:        m.Metadata.Description,
		Tags:               m.Metadata.Tags,
		Type:               m.Spec.Type,
		InfrastructureType: m.Spec.InfrastructureType,
	}

	switch m.Spec.Type {
	case model.ProbeTypeHTTPProbe:
		var p model.KubernetesHTTPProbeRequest
		if err := strictUnmarshal(m.Spec.Properties, &p); err != nil {
			return nil, fmt.Errorf("invalid spec.properties: %w", err)
		}
		if err := validateHTTPProbeProperties(&p); err != nil {
			return nil, err
		}
		req.KubernetesHTTPProperties = &p
	case model.ProbeTypeCmdProbe:
		var p model.KubernetesCMDProbeRequest
		if err := strictUnmarshal(m.Spec.Properties, &p); err != nil {
			return nil, fmt.Errorf("invalid spec.properties: %w", err)
		}
		if err := validateCMDProbeProperties(&p); err != nil {
			return nil, err
		}
		req.KubernetesCMDProperties = &p
	case model.ProbeTypePromProbe:
		var p model.PROMProbeRequest
		if err := strictUnmarshal(m.Spec.Properties, &p); err != nil {
			return nil, fmt.Errorf("invalid spec.properties: %w", err)
		}
		if err := validatePromProbeProperties(&p); err != nil {
			return nil, err
		}
		req.PromProperties = &p
	case model.ProbeTypeK8sProbe:
		var p model.K8SProbeRequest
		if err := strictUnmarshal(m.Spec.Properties, &p); err != nil {
			return nil, fmt.Errorf("invalid spec.properties: %w", err)
		}
		if err := validateK8SProbeProperties(&p); err != nil {
			return nil, err
		}
		req.K8sProperties = &p
	}

	return req, nil
}

// manifestKind returns the lowercase kind of a YAML or JSON manifest, or "" if it has none.
func manifestKind(data []byte) (string, error) {
	jsonData, err := yaml.YAMLToJSON(data)
	if err != nil {
		return "", err
	}
	return strings.ToLower(gjson.Get(string(jsonData), "kind").String()), nil
}

// strictUnmarshal is json.Unmarshal that fails on unknown fields.
func strictUnmarshal(data []byte, v interface{}) error {
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields()
	return dec.Decode(v)
}

// requireFields returns an error naming every field in required whose value is empty.
func requireFields(required map[string]string) error {
	var missing []string
	for name, value := range required {
		if value == "" {
			missing = append(missing, name)
		}
	}
	if len(missing) == 0 {
		return nil
	}
	// map iteration order is random; sort for deterministic error messages
	sort.Strings(missing)
	return fmt.Errorf("missing required spec.properties: %s", strings.Join(missing, ", "))
}

func validateHTTPProbeProperties(p *model.KubernetesHTTPProbeRequest) error {
	if err := requireFields(map[string]string{
		"probeTimeout": p.ProbeTimeout,
		"interval":     p.Interval,
		"url":          p.URL,
	}); err != nil {
		return err
	}
	if p.Method == nil || (p.Method.Get == nil && p.Method.Post == nil) {
		return errors.New("spec.properties.method must define either get or post")
	}
	if p.Method.Get != nil && p.Method.Post != nil {
		return errors.New("spec.properties.method must define only one of get or post")
	}
	if p.Method.Get != nil {
		return requireFields(map[string]string{
			"method.get.criteria":     p.Method.Get.Criteria,
			"method.get.responseCode": p.Method.Get.ResponseCode,
		})
	}
	return requireFields(map[string]string{
		"method.post.criteria":     p.Method.Post.Criteria,
		"method.post.responseCode": p.Method.Post.ResponseCode,
	})
}

func validateCMDProbeProperties(p *model.KubernetesCMDProbeRequest) error {
	if err := requireFields(map[string]string{
		"probeTimeout": p.ProbeTimeout,
		"interval":     p.Interval,
		"command":      p.Command,
	}); err != nil {
		return err
	}
	return validateComparator(p.Comparator)
}

func validatePromProbeProperties(p *model.PROMProbeRequest) error {
	if err := requireFields(map[string]string{
		"probeTimeout": p.ProbeTimeout,
		"interval":     p.Interval,
		"endpoint":     p.Endpoint,
	}); err != nil {
		return err
	}
	return validateComparator(p.Comparator)
}

func validateK8SProbeProperties(p *model.K8SProbeRequest) error {
	return requireFields(map[string]string{
		"probeTimeout": p.ProbeTimeout,
		"interval":     p.Interval,
		"version":      p.Version,
		"resource":     p.Resource,
		"operation":    p.Operation,
	})
}

func validateComparator(c *model.ComparatorInput) error {
	if c == nil {
		return errors.New("spec.properties.comparator is required")
	}
	return requireFields(map[string]string{
		"comparator.type":     c.Type,
		"comparator.criteria": c.Criteria,
		"comparator.value":    c.Value,
	})
}
