package utils

import (
	"os"
)

var (
	JwtSecret     = os.Getenv("JWT_SECRET")
	AdminName     = os.Getenv("ADMIN_USERNAME")
	AdminPassword = os.Getenv("ADMIN_PASSWORD")
	DBUrl         = os.Getenv("DB_SERVER")
	DBUser        = os.Getenv("DB_USER")
	DBPassword    = os.Getenv("DB_PASSWORD")
	DBName        = "auth"
)
