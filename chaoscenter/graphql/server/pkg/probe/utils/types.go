package utils

import (
	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

type HTTPProbeAttributes struct {
	// Name of probe
	Name string `json:"name,omitempty"`
	// Type of probe
	Type string `json:"type,omitempty"`
	// inputs needed for the http probe
	HTTPProbeInputs v1alpha1.HTTPProbeInputs `json:"httpProbe/inputs,omitempty"`
	// RunProperty contains timeout, retry and interval for the probe
	RunProperties v1alpha1.RunProperty `json:"runProperties,omitempty"`
	// mode for k8s probe
	// it can be SOT, EOT, Edge
	Mode string `json:"mode,omitempty"`
}

// HTTPMethod define the http method details
type HTTPMethod struct {
	Get  *v1alpha1.GetMethod  `json:"get,omitempty"`
	Post *v1alpha1.PostMethod `json:"post,omitempty"`
}

type CMDProbeAttributes struct {
	// Name of probe
	Name string `json:"name,omitempty"`
	// Type of probe
	Type string `json:"type,omitempty"`
	// inputs needed for the cmd probe
	CmdProbeInputs v1alpha1.CmdProbeInputs `json:"cmdProbe/inputs,omitempty"`
	// RunProperty contains timeout, retry and interval for the probe
	RunProperties v1alpha1.RunProperty `json:"runProperties,omitempty"`
	// mode for k8s probe
	// it can be SOT, EOT, Edge
	Mode string `json:"mode,omitempty"`
	// ResponseTimeout Flag to hold the flag to response timeout for the cmdProbe
	ResponseTimeout int `json:"responseTimeout,omitempty"`
}

type ProbeWithVerdict struct {
	Name    string             `json:"name"`
	Verdict model.ProbeVerdict `json:"verdict"`
}

type PROMProbeAttributes struct {
	// Name of probe
	Name string `json:"name,omitempty"`
	// Type of probe
	Type string `json:"type,omitempty"`
	// inputs needed for the prometheus probe
	PromProbeInputs v1alpha1.PromProbeInputs `json:"promProbe/inputs,omitempty"`
	// RunProperty contains timeout, retry and interval for the probe
	RunProperties v1alpha1.RunProperty `json:"runProperties,omitempty"`
	// mode for k8s probe
	// it can be SOT, EOT, Edge
	Mode string `json:"mode,omitempty"`
}

type K8SProbeAttributes struct {
	// Name of probe
	Name string `json:"name,omitempty"`
	// Type of probe
	Type string `json:"type,omitempty"`
	// inputs needed for the k8s probe
	K8sProbeInputs v1alpha1.K8sProbeInputs `json:"k8sProbe/inputs,omitempty"`
	// RunProperty contains timeout, retry and interval for the probe
	RunProperties v1alpha1.RunProperty `json:"runProperties,omitempty"`
	// mode for k8s probe
	// it can be SOT, EOT, Edge
	Mode string `json:"mode,omitempty"`
}
