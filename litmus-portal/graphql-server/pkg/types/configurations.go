package types

//SubscriberConfigurationVars contains the required configurable parameters for subscriber installation
type SubscriberConfigurationVars struct {
	Server          string
	SubscriberImage string
	SubscriberNS    string
	SubscriberSC    string
	WorkflowSC      string
	WorkflowNS      string
	ArgoSER         string
	ArgoWFCTRL      string
	LitmusCOP       string
	ArgoWFEXEC      string
	LitmusCRUN      string
}
