package probe

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
	HTTPProbeInputs *HTTPProbeInputs `json:"httpProbe/inputs,omitempty"`
	// RunProperty contains timeout, retry and interval for the probe
	RunProperties v1alpha1.RunProperty `json:"runProperties,omitempty"`
	// mode for k8s probe
	// it can be SOT, EOT, Edge
	Mode string `json:"mode,omitempty"`
}

// HTTPProbeInputs contains all the inputs required for http probe
type HTTPProbeInputs struct {
	// URL which needs to curl, to check the status
	URL string `json:"url,omitempty"`
	// InsecureSkipVerify flag to skip certificate checks
	InsecureSkipVerify bool `json:"insecureSkipVerify,omitempty"`
	// Method define the http method, it can be get or post
	Method v1alpha1.HTTPMethod `json:"method,omitempty"`
	// ResponseTimeout Flag to hold the flag to response timeout for the httpProbe
	ResponseTimeout int `json:"responseTimeout,omitempty"`
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
	CmdProbeInputs CmdProbeInputs `json:"cmdProbe/inputs,omitempty"`
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

// CmdProbeInputs contains all the inputs required for cmd probe
// Duplicate type of v1alpha1.CmdProbeInputs because of extra nil pointer reference to Source object
// as it is optional for CMD Probe Input
type CmdProbeInputs struct {
	// Command need to be executed for the probe
	Command string `json:"command,omitempty"`
	// Comparator check for the correctness of the probe output
	Comparator v1alpha1.ComparatorInfo `json:"comparator,omitempty"`
	// The source where we have to run the command
	// It will run in inline(inside experiment itself) mode if source is nil
	Source *v1alpha1.SourceDetails `json:"source,omitempty"`
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
