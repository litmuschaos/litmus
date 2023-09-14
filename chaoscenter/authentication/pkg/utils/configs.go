package utils

import (
	"os"
	"strconv"
)

var (
	JwtSecret                    = os.Getenv("JWT_SECRET")
	AdminName                    = os.Getenv("ADMIN_USERNAME")
	AdminPassword                = os.Getenv("ADMIN_PASSWORD")
	DBUrl                        = os.Getenv("DB_SERVER")
	DBUser                       = os.Getenv("DB_USER")
	DBPassword                   = os.Getenv("DB_PASSWORD")
	JWTExpiryDuration            = getEnvAsInt("JWT_EXPIRY_MINS", 1440)
	OAuthJWTExpDuration          = getEnvAsInt("OAUTH_JWT_EXP_MINS", 5)
	OAuthJwtSecret               = os.Getenv("OAUTH_SECRET")
	StrictPasswordPolicy         = getEnvAsBool("STRICT_PASSWORD_POLICY", false)
	DexEnabled                   = getEnvAsBool("DEX_ENABLED", false)
	DexCallBackURL               = os.Getenv("DEX_OAUTH_CALLBACK_URL")
	DexClientID                  = os.Getenv("DEX_OAUTH_CLIENT_ID")
	DexClientSecret              = os.Getenv("DEX_OAUTH_CLIENT_SECRET")
	DexOIDCIssuer                = os.Getenv("OIDC_ISSUER")
	DBName                       = "auth"
	Port                         = ":3000"
	GrpcPort                     = ":3030"
	UserCollection               = "users"
	ProjectCollection            = "project"
	RevokedTokenCollection       = "revoked-token"
	ApiTokenCollection           = "api-token"
	UsernameField                = "username"
	ExpiresAtField               = "expires_at"
	PasswordEncryptionCost       = 15
	DefaultLitmusGqlGrpcEndpoint = "localhost"
	DefaultLitmusGqlGrpcPort     = ":8000"
)

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := os.Getenv(name)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsBool(name string, defaultVal bool) bool {
	valueStr := os.Getenv(name)
	if valueStr, err := strconv.ParseBool(valueStr); err == nil {
		return valueStr
	}
	return defaultVal
}
