package types

import "litmus/litmus-portal/authentication/pkg/entities"

// Project contains the required fields to be returned by GET APIs
type Project struct {
	entities.Audit `bson:",inline"`
	ID             string    `bson:"_id"`
	UID            string    `bson:"uid"`
	Name           string    `bson:"name"`
	Members        []*Member `bson:"members"`
	State          *string   `bson:"state"`
}

// Member contains the required fields to be returned by GET APIs
type Member struct {
	UserID        string              `bson:"user_id"`
	UserName      string              `bson:"username"`
	Name          string              `bson:"name"`
	Role          entities.MemberRole `bson:"role"`
	Email         string              `bson:"email"`
	Invitation    entities.Invitation `bson:"invitation"`
	JoinedAt      string              `bson:"joined_at"`
	DeactivatedAt *int64              `bson:"deactivated_at"`
}
