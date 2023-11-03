package project

import "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

// Project contains the required fields to be stored in the database for a project
type Project struct {
	mongodb.Audit `bson:",inline"`
	ID            string    `bson:"_id"`
	Name          string    `bson:"name"`
	Members       []*Member `bson:"members"`
	State         *string   `bson:"state"`
}

// Member contains the required fields to be stored in the database for a member
type Member struct {
	UserID     string     `bson:"user_id"`
	Role       MemberRole `bson:"role"`
	Invitation Invitation `bson:"invitation"`
	JoinedAt   int64      `bson:"joined_at"`
}

// MemberRole defines the project role a member has in the project
type MemberRole string

const (
	RoleOwner  MemberRole = "Owner"
	RoleEditor MemberRole = "Editor"
	RoleViewer MemberRole = "Viewer"
)

// Invitation defines the type of the invitation that is sent by the Owner of the project to other users
type Invitation string

const (
	// PendingInvitation is the state when the Invitation is sent but not accepted
	PendingInvitation Invitation = "Pending"

	// AcceptedInvitation is the state when the Invitation is accepted
	AcceptedInvitation Invitation = "Accepted"

	// DeclinedInvitation is the state when the Invitation is rejected/declined
	DeclinedInvitation Invitation = "Declined"

	// ExitedProject is the state when the user has exited the project
	ExitedProject Invitation = "Exited"
)

type ProjectCreationEvent struct {
	OperationType string  `bson:"operationType"`
	FullDocument  Project `bson:"fullDocument"`
}
