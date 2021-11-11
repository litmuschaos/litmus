package entities

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
	UserID        string     `bson:"user_id"`
	UserName      string     `bson:"username"`
	Name          string     `bson:"name"`
	Role          MemberRole `bson:"role"`
	Email         string     `bson:"email"`
	Invitation    Invitation `bson:"invitation"`
	JoinedAt      string     `bson:"joined_at"`
	DeactivatedAt string     `bson:"deactivated_at"`
}

type ProjectInput struct {
	ProjectID   string `bson:"project_id" json:"project_id"`
	ProjectName string `bson:"project_name" json:"project_name"`
}

type CreateProjectInput struct {
	ProjectName string `bson:"project_name" json:"project_name"`
	UserID      string `bson:"user_id" json:"user_id"`
}

type MemberInput struct {
	ProjectID string      `json:"project_id"`
	UserID    string      `json:"user_id"`
	Role      *MemberRole `json:"role"`
}

// GetProjectOutput takes a Project struct as input and returns the graphQL model equivalent
func (project *Project) GetProjectOutput() *Project {

	return &Project{
		ID:        project.ID,
		UID:       project.UID,
		Name:      project.Name,
		Members:   project.GetMemberOutput(),
		State:     project.State,
		CreatedAt: project.CreatedAt,
		UpdatedAt: project.UpdatedAt,
		RemovedAt: project.RemovedAt,
	}
}

// GetMemberOutput takes a Project struct as input and returns the graphQL model equivalent for a members of the project
func (project *Project) GetMemberOutput() []*Member { // add logic to get member details from auth

	var outputMembers []*Member

	for _, member := range project.Members {
		outputMembers = append(outputMembers, member.GetMemberOutput())
	}

	return outputMembers
}

// GetMemberOutput takes a Member struct as input and returns the graphQL model equivalent
func (member *Member) GetMemberOutput() *Member {

	return &Member{
		UserID:        member.UserID,
		UserName:      member.UserName,
		Name:          member.Name,
		Role:          member.Role,
		Email:         member.Email,
		Invitation:    member.Invitation,
		JoinedAt:      member.JoinedAt,
		DeactivatedAt: member.DeactivatedAt,
	}
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
