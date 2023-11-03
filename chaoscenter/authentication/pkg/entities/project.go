package entities

// Project contains the required fields to be stored in the database for a project
type Project struct {
	Audit   `bson:",inline"`
	ID      string    `bson:"_id" json:"projectID"`
	Name    string    `bson:"name" json:"name"`
	Members []*Member `bson:"members" json:"members"`
	State   *string   `bson:"state" json:"state"`
}

type Owner struct {
	UserID   string `bson:"user_id" json:"userID"`
	Username string `bson:"username" json:"username"`
}
type MemberStat struct {
	Owner *[]Owner `bson:"owner" json:"owner"`
	Total int      `bson:"total" json:"total"`
}

type ProjectStats struct {
	Name      string      `bson:"name" json:"name"`
	ProjectID string      `bson:"_id" json:"projectID"`
	Members   *MemberStat `bson:"memberStat" json:"members"`
}

// Member contains the required fields to be stored in the database for a member
type Member struct {
	UserID        string     `bson:"user_id" json:"userID"`
	Username      string     `bson:"username" json:"username"`
	Email         string     `bson:"email" json:"email"`
	Name          string     `bson:"name" json:"name"`
	Role          MemberRole `bson:"role" json:"role"`
	Invitation    Invitation `bson:"invitation" json:"invitation"`
	JoinedAt      int64      `bson:"joined_at" json:"joinedAt"`
	DeactivatedAt *int64     `bson:"deactivated_at,omitempty" json:"deactivatedAt,omitempty"`
}

type Members struct {
	Members []*Member `bson:"members" json:"members"`
}

type ProjectInput struct {
	ProjectID   string `bson:"project_id" json:"projectID"`
	ProjectName string `bson:"project_name" json:"projectName"`
}

type CreateProjectInput struct {
	ProjectName string `bson:"project_name" json:"projectName"`
	UserID      string `bson:"user_id" json:"userID"`
}

type MemberInput struct {
	ProjectID string      `json:"projectID"`
	UserID    string      `json:"userID"`
	Role      *MemberRole `json:"role"`
}

type ListInvitationResponse struct {
	ProjectID      string     `json:"projectID"`
	ProjectName    string     `json:"projectName"`
	ProjectOwner   Member     `json:"projectOwner"`
	InvitationRole MemberRole `json:"invitationRole"`
}

// GetProjectOutput takes a Project struct as input and returns the graphQL model equivalent
func (project *Project) GetProjectOutput() *Project {

	return &Project{
		ID:      project.ID,
		Name:    project.Name,
		Members: project.GetMemberOutput(),
		State:   project.State,
		Audit: Audit{
			IsRemoved: project.IsRemoved,
			CreatedAt: project.CreatedAt,
			CreatedBy: project.UpdatedBy,
			UpdatedAt: project.UpdatedAt,
			UpdatedBy: project.UpdatedBy,
		},
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
		UserID:     member.UserID,
		Role:       member.Role,
		Invitation: member.Invitation,
		JoinedAt:   member.JoinedAt,
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

type State string

const (
	Accepted    State = "accepted"
	NotAccepted State = "not_accepted"
	All         State = "all"
)
