package entities

// RevokedToken struct for storing revoked tokens
type RevokedToken struct {
	Token     string `bson:"token"`
	ExpireOn  int64  `bson:"expire_on"`
	CreatedAt int64  `bson:"created_at"`
}
