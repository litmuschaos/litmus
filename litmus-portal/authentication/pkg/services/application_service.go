package services

import (
	"litmus/litmus-portal/authentication/pkg/misc"
	"litmus/litmus-portal/authentication/pkg/project"
	"litmus/litmus-portal/authentication/pkg/user"

	"go.mongodb.org/mongo-driver/mongo"
)

type ApplicationService interface {
	userService
	projectService
	transactionService
	miscService
}

type applicationService struct {
	userRepository    user.Repository
	projectRepository project.Repository
	miscRepository    misc.Repository
	db                *mongo.Database
}

// NewService creates a new instance of this service
func NewService(userRepo user.Repository, projectRepo project.Repository, miscRepo misc.Repository, db *mongo.Database) ApplicationService {
	return &applicationService{
		userRepository:    userRepo,
		projectRepository: projectRepo,
		db:                db,
		miscRepository:    miscRepo,
	}
}
