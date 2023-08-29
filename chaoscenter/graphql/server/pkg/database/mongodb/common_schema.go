package mongodb

type ResourceDetails struct {
	Name        string   `bson:"name"`
	Description string   `bson:"description"`
	Tags        []string `bson:"tags"`
}

type Audit struct {
	UpdatedAt int64  `bson:"updated_at"`
	CreatedAt int64  `bson:"created_at"`
	CreatedBy string `bson:"created_by"`
	UpdatedBy string `bson:"updated_by"`
	IsRemoved bool   `bson:"is_removed"`
}
