package grpc

import (
	"litmus/litmus-portal/authentication/api/presenter/protos"
	"litmus/litmus-portal/authentication/pkg/services"
)

type ServerGrpc struct {
	services.ApplicationService
	protos.UnimplementedAuthRpcServiceServer
}
