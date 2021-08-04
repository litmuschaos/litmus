package v2_0_0

import "go.uber.org/zap"

type VersionManager struct {
	Logger zap.Logger
}

func NewVersionManger(logger zap.Logger) *VersionManager{
	return &VersionManager{Logger: logger}
}

func(vm VersionManager) Run() error{
	// add logic for updating from previous version to the "this" version
	return nil
}