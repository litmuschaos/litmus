package types

import (
	"os"
	"time"
)

// define the type of authorization request
var (
	DefaultAPISecret           string = os.Getenv("JWT_SECRET")
	DefaultUserName            string = os.Getenv("ADMIN_USERNAME")
	DefaultUserPassword        string = os.Getenv("ADMIN_PASSWORD")
	DefaultDBServerURL         string = os.Getenv("DB_SERVER")
	DBUser                     string = os.Getenv("DB_USER")
	DBPassword                 string = os.Getenv("DB_PASSWORD")
	DefaultAuthDB              string = "auth"
	DefaultLocalAuthCollection string = "usercredentials"
	PasswordEncryptionCost     int    = 15
	TimeFormat                 string = time.RFC1123Z
)
