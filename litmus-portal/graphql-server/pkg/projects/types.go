package projects

import pb "github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"

// ProjectServer is used to implement project.ProjectServer
type ProjectServer struct {
	pb.UnimplementedProjectServer
}
