package schema

import "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"

//Project ...
type Project struct {
	ID        string    `bson:"_id"`
	Name      string    `bson:"name"`
	Members   []*Member `bson:"members"`
	State     *string   `bson:"state"`
	CreatedAt string    `bson:"created_at"`
	UpdatedAt string    `bson:"updated_at"`
	RemovedAt string    `bson:"removed_at"`
}

//GetOutputProject ...
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

//GetOutputMembers ...
func (project *Project) GetOutputMembers() []*model.Member {

	outputMembers := []*model.Member{}

	for _, member := range project.Members {
		outputMembers = append(outputMembers, member.GetOutputMember())
	}

	return outputMembers
}

//Member ...
type Member struct {
	UserID     string     `bson:"user_id"`
	UserName   string     `bson:"username"`
	Role       MemberRole `bson:"role"`
	Invitation Invitation `bson:"invitation"`
}

//GetOutputMember ...
func (member *Member) GetOutputMember() *model.Member {

	return &model.Member{
		UserID:     member.UserID,
		UserName:   member.UserName,
		Role:       string(member.Role),
		Invitation: string(member.Invitation),
	}
}

//MemberRole ...
type MemberRole string

const (
	//RoleOwner ...
	RoleOwner MemberRole = "Owner"

	//RoleEditor ...
	RoleEditor MemberRole = "Editor"

	//RoleViewer ...
	RoleViewer MemberRole = "Viewer"
)

//Invitation ...
type Invitation string

const (
	//PendingInvitation ...
	PendingInvitation Invitation = "Pending"

	//AcceptedInvitation ...
	AcceptedInvitation Invitation = "Accepted"

	//DeclinedInvitation ...
	DeclinedInvitation Invitation = "Declined"
)
