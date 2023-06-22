package projects

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	pb "github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
)

// ProjectServer is used to implement project.ProjectServer
type ProjectServer struct {
	pb.UnimplementedProjectServer
	Operator mongodb.MongoOperator
}
