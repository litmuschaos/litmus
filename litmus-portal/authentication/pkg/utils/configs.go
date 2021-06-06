package utils

import (
	"os"
)

var (
	JwtSecret              string = os.Getenv("JWT_SECRET")
	AdminName              string = os.Getenv("ADMIN_USERNAME")
	AdminPassword          string = os.Getenv("ADMIN_PASSWORD")
	DBUrl                  string = os.Getenv("DB_SERVER")
	DBUser                 string = os.Getenv("DB_USER")
	DBPassword             string = os.Getenv("DB_PASSWORD")
	DBName                 string = "auth"
)
