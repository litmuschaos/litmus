package types

import "litmus/litmus-portal/authentication/pkg/entities"

// Project contains the required fields to be stored in the database for a project
type Project struct {
	ID        string    `bson:"_id"`
	UID       string    `bson:"uid"`
	Name      string    `bson:"name"`
	Members   []*Member `bson:"members"`
	State     *string   `bson:"state"`
	CreatedAt string    `bson:"created_at"`
	UpdatedAt string    `bson:"updated_at"`
	RemovedAt string    `bson:"removed_at"`
}

// Member contains the required fields to be stored in the database for a member
type Member struct {
	UserID        string              `bson:"user_id"`
	UserName      string              `bson:"username"`
	Name          string              `bson:"name"`
	Role          entities.MemberRole `bson:"role"`
	Email         string              `bson:"email"`
	Invitation    entities.Invitation `bson:"invitation"`
	JoinedAt      string              `bson:"joined_at"`
	DeactivatedAt *string             `bson:"deactivated_at"`
}
