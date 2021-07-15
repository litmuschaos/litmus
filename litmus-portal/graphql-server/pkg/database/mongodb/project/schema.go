package project

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

// Project contains the required fields to be stored in the database for a project
type Project struct {
	ID        string    `bson:"_id"`
	Name      string    `bson:"name"`
	Members   []*Member `bson:"members"`
	State     *string   `bson:"state"`
	CreatedAt string    `bson:"created_at"`
	UpdatedAt string    `bson:"updated_at"`
	RemovedAt string    `bson:"removed_at"`
}

// GetOutputProject takes a Project struct as input and returns the graphQL model equivalent
func (project *Project) GetOutputProject() *model.Project {

	return &model.Project{
		ID:        project.ID,
		Name:      project.Name,
		Members:   project.GetOutputMembers(),
		State:     project.State,
		CreatedAt: project.CreatedAt,
		UpdatedAt: project.UpdatedAt,
		RemovedAt: project.RemovedAt,
	}
}

// GetOutputMembers takes a Project struct as input and returns the graphQL model equivalent for a members of the project
func (project *Project) GetOutputMembers() []*model.Member {

	var outputMembers []*model.Member

	for _, member := range project.Members {
		outputMembers = append(outputMembers, member.GetOutputMember())
	}

	return outputMembers
}

// Member contains the required fields to be stored in the database for a member
type Member struct {
	UserID        string           `bson:"user_id"`
	UserName      string           `bson:"username"`
	Name          string           `bson:"name"`
	Email         string           `bson:"email"`
	Role          model.MemberRole `bson:"role"`
	Invitation    Invitation       `bson:"invitation"`
	JoinedAt      string           `bson:"joined_at"`
	DeactivatedAt string           `bson:"deactivated_at"`
}

// GetOutputMember takes a Member struct as input and returns the graphQL model equivalent
func (member *Member) GetOutputMember() *model.Member {

	return &model.Member{
		UserID:        member.UserID,
		UserName:      member.UserName,
		Name:          member.Name,
		Email:         member.Email,
		Role:          member.Role,
		Invitation:    string(member.Invitation),
		JoinedAt:      member.JoinedAt,
		DeactivatedAt: member.DeactivatedAt,
	}
}

// Invitation defines the type of the invitation that is sent by the Owner of the project to other users
type Invitation string

const (
	// PendingInvitation is the state when the Invitation is sent but not accepted
	PendingInvitation Invitation = "Pending"

	// AcceptedInvitation is the state when the Invitation is sent and is accepted as well
	AcceptedInvitation Invitation = "Accepted"

	// DeclinedInvitation is the state when the Invitation is sent but it is rejected/declined
	DeclinedInvitation Invitation = "Declined"

	//ExitedProject is the state when the user has exited the project
	ExitedProject Invitation = "Exited"
)
