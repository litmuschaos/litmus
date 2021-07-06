package utils

import (
	"os"
	"strconv"
)

var (
	JwtSecret              = os.Getenv("JWT_SECRET")
	AdminName              = os.Getenv("ADMIN_USERNAME")
	AdminPassword          = os.Getenv("ADMIN_PASSWORD")
	DBUrl                  = os.Getenv("DB_SERVER")
	DBUser                 = os.Getenv("DB_USER")
	DBPassword             = os.Getenv("DB_PASSWORD")
	JWTExpiryDuration      = getEnvAsInt("JWT_EXPIRY_MINS", 1440)
	StrictPasswordPolicy   = getEnvAsBool("STRICT_PASSWORD_POLICY", false)
	DBName                 = "auth"
	Port                   = ":3002"
	CollectionName         = "usercredentials"
	UsernameField          = "username"
	PasswordEncryptionCost = 15
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
