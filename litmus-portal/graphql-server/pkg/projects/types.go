package projects

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	pb "github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
)

// ProjectServer is used to implement project.ProjectServer
type ProjectServer struct {
	pb.UnimplementedProjectServer
	Operator mongodb.MongoOperator
}
