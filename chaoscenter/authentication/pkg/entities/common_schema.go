package entities

type ResourceDetails struct {
	Name        string   `bson:"name" json:"name"`
	Description string   `bson:"description" json:"description"`
	Tags        []string `bson:"tags" json:"tags"`
}

type Audit struct {
	UpdatedAt int64              `bson:"updated_at" json:"updatedAt"`
	CreatedAt int64              `bson:"created_at" json:"createdAt"`
	CreatedBy UserDetailResponse `bson:"created_by" json:"createdBy"`
	UpdatedBy UserDetailResponse `bson:"updated_by" json:"updatedBy"`
	IsRemoved bool               `bson:"is_removed" json:"isRemoved"`
}

type UserDetailResponse struct {
	UserID   string `bson:"user_id" json:"userID"`
	Username string `bson:"username" json:"username"`
	Email    string `bson:"email" json:"email"`
}
