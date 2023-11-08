package response

type Response struct {
	Response string
}

type ApiTokenResponse struct {
	UserID    string
	Name      string
	Token     string
	ExpiresAt int64
	CreatedAt int64
}

type Role string
type UserResponse struct {
	ID            string `bson:"_id,omitempty" json:"userID"`
	Username      string `bson:"username,omitempty" json:"username"`
	Password      string `bson:"password,omitempty" json:"password,omitempty"`
	Email         string `bson:"email,omitempty" json:"email,omitempty"`
	Name          string `bson:"name,omitempty" json:"name,omitempty"`
	Role          Role   `bson:"role,omitempty" json:"role"`
	DeactivatedAt *int64 `bson:"deactivated_at,omitempty" json:"deactivatedAt,omitempty"`
}

type MessageResponse struct {
	Message string
}

type NewApiToken struct {
	accessToken string
}

type LoginResponse struct {
	accessToken string
	projectID   string
	projectRole string
	expiresIn   string
}
