package entities

// Project contains the required fields to be stored in the database for a project
type Project struct {
	Audit   `bson:",inline"`
	ID      string    `bson:"_id"`
	Name    string    `bson:"name"`
	Members []*Member `bson:"members"`
	State   *string   `bson:"state"`
}

type Owner struct {
	UserID   string `bson:"user_id"`
	Username string `bson:"username"`
}
type MemberStat struct {
	Owner *[]Owner `bson:"owner"`
	Total int      `bson:"total"`
}

type ProjectStats struct {
	Name      string      `bson:"name"`
	ProjectID string      `bson:"_id"`
	Members   *MemberStat `bson:"memberStat"`
}

// Member contains the required fields to be stored in the database for a member
type Member struct {
	UserID     string     `bson:"user_id"`
	Role       MemberRole `bson:"role"`
	Invitation Invitation `bson:"invitation"`
	JoinedAt   string     `bson:"joined_at"`
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
