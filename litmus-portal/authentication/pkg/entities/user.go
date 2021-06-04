package entities

import "time"

//User contains the user information
type User struct {
	ID        string     `bson:"_id,omitempty"`
	UserName  string     `bson:"username,omitempty"`
	Password  string     `bson:"password,omitempty"`
	Email     string     `bson:"email,omitempty"`
	Name      string     `bson:"name,omitempty"`
	Role      Role       `bson:"role"`
	LoggedIn  bool       `bson:"logged_in,omitempty"`
	CreatedAt *time.Time `bson:"created_at,omitempty"`
	UpdatedAt *time.Time `bson:"updated_at,omitempty"`
	RemovedAt *time.Time `bson:"removed_at,omitempty"`
	State     State      `bson:"state,omitempty"`
}

//Role states the role of the user in the portal
type Role string

const (
	//RoleAdmin gives the admin permissions to a user
	RoleAdmin Role = "admin"

	//RoleUser gives the normal user permissions to a user
	RoleUser Role = "user"
)

//State is the current state of the database entry of the user
type State string

const (
	//StateCreating means this entry is being created
	StateCreating State = "creating"
	//StateActive means this entry is active
	StateActive State = "active"
	//StateRemoving means this entry is being removed
	StateRemoving State = "removing"
	//StateRemoved means this entry has been removed
	StateRemoved State = "removed"
)

func (user *User) sanitizedUser() *User {
	user.Password = ""
	return user
}


