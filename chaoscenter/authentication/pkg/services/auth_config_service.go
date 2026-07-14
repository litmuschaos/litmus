package services

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
)

type authConfigService interface {
	CreateConfig(config authConfig.AuthConfig) error
	GetConfig(key string) (*authConfig.AuthConfig, error)
	UpdateConfig(ctx context.Context, key string, value interface{}) error
}

func (a applicationService) CreateConfig(config authConfig.AuthConfig) error {
	return a.authConfigRepo.CreateConfig(config)
}

func (a applicationService) GetConfig(key string) (*authConfig.AuthConfig, error) {
	return a.authConfigRepo.GetConfig(key)
}

func (a applicationService) UpdateConfig(ctx context.Context, key string, value interface{}) error {
	return a.authConfigRepo.UpdateConfig(ctx, key, value)
}
