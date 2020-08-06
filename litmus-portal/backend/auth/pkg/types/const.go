package types

import "time"

// define the type of authorization request
const (
	RedirectURI                string = "http://localhost:3000/"
	DefaultDBServerURL         string = "mongodb://localhost:27017"
	DefaultAuthDB              string = "auth"
	DefaultLocalAuthCollection string = "usercredentials"
	DefaultAPISecret           string = "litmus-portal@123"
	DefaultUserName            string = "admin"
	DefaultUserPassword        string = "litmus"
	PasswordEncryptionCost     int    = 15
	TimeFormat                 string = time.RFC1123Z
)
