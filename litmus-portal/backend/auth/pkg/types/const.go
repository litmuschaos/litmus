package types

import (
	"time"
)

// define the type of authorization request
var (
	DefaultAPISecret           string = "litmus-portal@123"
	DefaultUserName            string = "admin"
	DefaultUserPassword        string = "litmus"
	DefaultDBServerURL         string = "mongodb://localhost:27017"
	DefaultAuthDB              string = "auth"
	DefaultLocalAuthCollection string = "usercredentials"
	PasswordEncryptionCost     int    = 15
	TimeFormat                 string = time.RFC1123Z
)
