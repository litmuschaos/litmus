package grpc

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
)

type ServerGrpc struct {
	services.ApplicationService
	protos.UnimplementedAuthRpcServiceServer
}
