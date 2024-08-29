package types

type MemberState string

const (
	MemberStateActive   MemberState = "active"
	MemberStateInactive MemberState = "inactive"
)

const (
	ProjectName = "projectName"
	SortField   = "sortField"
	Ascending   = "sortAscending"
	CreatedByMe = "createdByMe"
	Page        = "page"
	Limit       = "limit"
)
