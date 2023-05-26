package authorization

import (
	"context"
	"errors"
	"fmt"
	"github.com/harness/hce-saas/graphql/server/pkg/grpc"

	grpc2 "google.golang.org/grpc"
)

// ValidateRole Validates the role of a user in a given project
func ValidateRole(ctx context.Context, projectID string,
	requiredRoles []string, invitation string) error {
	jwt := ctx.Value(AuthKey).(string)
	fmt.Println("here1")
	var conn *grpc2.ClientConn

	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	fmt.Println(client)
	defer conn.Close()
	fmt.Println("here11g", jwt)
	err := grpc.ValidatorGRPCRequest(client, jwt, projectID,
		requiredRoles,
		invitation)
	if err != nil {
		fmt.Println("here11", err)
		return errors.New("permission_denied")
	}
	fmt.Println("here2")
	return nil
}
