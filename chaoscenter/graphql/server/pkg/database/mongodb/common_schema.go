package mongodb

type ResourceDetails struct {
	Name        string   `bson:"name"`
	Description string   `bson:"description"`
	Tags        []string `bson:"tags"`
}

type Audit struct {
	UpdatedAt int64              `bson:"updated_at"`
	CreatedAt int64              `bson:"created_at"`
	CreatedBy UserDetailResponse `bson:"created_by" json:"createdBy"`
	UpdatedBy UserDetailResponse `bson:"updated_by" json:"updatedBy"`
	IsRemoved bool               `bson:"is_removed"`
}

type UserDetailResponse struct {
	UserID   string `bson:"user_id" json:"userID"`
	Username string `bson:"username" json:"username"`
	Email    string `bson:"email" json:"email"`
}
