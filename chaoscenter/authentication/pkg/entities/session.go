package entities

// RevokedToken struct for storing revoked tokens
type RevokedToken struct {
	Token     string `bson:"token"`
	ExpiresAt int64  `bson:"expires_at"`
	CreatedAt int64  `bson:"created_at"`
}
