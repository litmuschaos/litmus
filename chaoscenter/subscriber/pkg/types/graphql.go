package types

type ExperimentRunResponse struct {
	Data ExperimentRun `json:"data"`
}

type ExperimentRun struct {
	ExperimentRun Phase `json:"getExperimentRunPhase"`
}

type Phase struct {
	Phase string `json:"phase"`
}
