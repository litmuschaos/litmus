package projects

import (
	"github.com/harness/hce-saas/graphql/server/pkg/database/mongodb"
	pb "github.com/harness/hce-saas/graphql/server/protos"
)

// ProjectServer is used to implement project.ProjectServer
type ProjectServer struct {
	pb.UnimplementedProjectServer
	Operator mongodb.MongoOperator
}
