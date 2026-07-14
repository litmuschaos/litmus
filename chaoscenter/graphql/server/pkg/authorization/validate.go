package authorization

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/grpc"
	"github.com/sirupsen/logrus"

	grpc2 "google.golang.org/grpc"
)

// ValidateRole Validates the role of a user in a given project
func ValidateRole(ctx context.Context, projectID string,
	requiredRoles []string, invitation string) error {
	jwt := ctx.Value(AuthKey).(string)
	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()
	err := grpc.ValidatorGRPCRequest(client, jwt, projectID,
		requiredRoles,
		invitation)
	if err != nil {
		logrus.Error(err)
		return errors.New("permission_denied: " + err.Error())
	}
	return nil
}
