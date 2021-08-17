package handlers

import (
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"

	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"

	"net/http"
	"os"

        "strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

var (
	providerURL  = os.Getenv("OIDC_PROVIDER_URL")
	callbackURL = os.Getenv("OIDC_CALLBACK_URL")
	clientID     = os.Getenv("OIDC_CLIENT_ID")
	clientSecret = os.Getenv("OIDC_CLIENT_SECRET")
)

func getHost(r *http.Request) string {
    if r.URL.IsAbs() {
        host := r.Host
        // Slice off any port information.
        if i := strings.Index(host, ":"); i != -1 {
            host = host[:i]
        }
        return host
    }
    return r.URL.Host
}

func randString(nByte int) (string, error) {
	b := make([]byte, nByte)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func setCallbackCookie(
    c *gin.Context,
    name string,
    value string,
) {
    http.SetCookie(c.Writer, &http.Cookie{
        Name:     name,
        Value:    value,
        MaxAge:   int(time.Hour.Seconds()),
        Path:     "/",
        Domain:   getHost(c.Request),
        Secure:   c.Request.TLS != nil,
        HttpOnly: true,
    })
}

func setJWTCookie(
    c *gin.Context,
    name string,
    value string,
) {
    http.SetCookie(c.Writer, &http.Cookie{
        Name:     name,
        Value:    value,
        MaxAge:   int(time.Duration(utils.JWTExpiryDuration) * 60),
        Path:     "/",
        Domain:   getHost(c.Request),
        Secure:   c.Request.TLS != nil,
        HttpOnly: false,
    })
}

func Cookie(
    c *gin.Context,
    name string,
) (string, error) {
    cookie, err := c.Request.Cookie(name)
    if err != nil {
        return "", err
    }
    val := cookie.Value
    return val, nil
}



// Status will request users list and return, if successful,
// an http code 200
func Status(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(500, entities.APIStatus{"down"})
			return
		}
		c.JSON(200, entities.APIStatus{"up"})
	}
}

// Status will request users list and return, if successful,
// an http code 200
func LoginOIDC(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		provider, err := oidc.NewProvider(c, providerURL)
		if err != nil {
			log.Fatal(err)
		}


		config := oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  callbackURL,
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		}

		state, err := randString(16)
		if err != nil {
			http.Error(c.Writer, "Internal error", http.StatusInternalServerError)
			return
		}

		nonce, err := randString(16)
		if err != nil {
			http.Error(c.Writer, "Internal error", http.StatusInternalServerError)
			return
		}

		setCallbackCookie(c, "state", state)
		setCallbackCookie(c, "nonce", nonce)

		c.Redirect(http.StatusFound, config.AuthCodeURL(state, oidc.Nonce(nonce)))
	}
}

// LoginOIDC will initiate the login process
// and redirect user to third party oidc server
func CallBackOIDC(service user.Service) gin.HandlerFunc {
        return func(c *gin.Context) {
		provider, err := oidc.NewProvider(c, providerURL)
		if err != nil {
			log.Fatal(err)
		}
		oidcConfig := &oidc.Config{
			ClientID: clientID,
		}
		verifier := provider.Verifier(oidcConfig)

		config := oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  callbackURL,
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		}

		state, err := Cookie(c, "state")
		if err != nil {
			http.Error(c.Writer, "state not found", http.StatusBadRequest)
			return
		}
		if c.Request.URL.Query().Get("state") != state {
			http.Error(c.Writer, "state did not match", http.StatusBadRequest)
			return
		}

		oauth2Token, err := config.Exchange(c, c.Request.URL.Query().Get("code"))
		if err != nil {
			http.Error(c.Writer, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
			return
		}
		rawIDToken, ok := oauth2Token.Extra("id_token").(string)
		if !ok {
			http.Error(c.Writer, "No id_token field in oauth2 token.", http.StatusInternalServerError)
			return
		}
		idToken, err := verifier.Verify(c, rawIDToken)
		if err != nil {
			http.Error(c.Writer, "Failed to verify ID Token: "+err.Error(), http.StatusInternalServerError)
			return
		}

		nonce, err := c.Request.Cookie("nonce")
		if err != nil {
			http.Error(c.Writer, "nonce not found", http.StatusBadRequest)
			return
		}
		if idToken.Nonce != nonce.Value {
			http.Error(c.Writer, "nonce did not match", http.StatusBadRequest)
			return
		}

                var rawUserInfos json.RawMessage
                if err := idToken.Claims(&rawUserInfos); err != nil {
                        http.Error(c.Writer, err.Error(), http.StatusInternalServerError)
                        return
                }
                var userInfos map[string]interface{}
                if err := json.Unmarshal(rawUserInfos, &userInfos); err != nil {
                  panic(err)
                }


//                var userOIDCDefault string
//                userOIDCDefault = "never"
//                userOIDC := &entities.User{
//                  ID: userInfos["nonce"].(string),
//                  UserName: userInfos["nickname"].(string),
//                  Password: "none",
//                  Email: userInfos["email"].(string),
//                  Name: userInfos["name"].(string),
//                  Role: "admin",
//                  CreatedAt: &userOIDCDefault,
//                  UpdatedAt: &userOIDCDefault,
//                  DeactivatedAt: &userOIDCDefault,
//                }

                userOIDC, err := service.FindUser("admin")
                token, err := userOIDC.GetSignedJWT()
                if err != nil {
                        log.Error(err)
                        c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
                        return
                }

//		oauth2Token.AccessToken = token
//
//		resp := struct {
//			OAuth2Token   *oauth2.Token
//			IDTokenClaims *json.RawMessage // ID Token payload is just JSON.
//		}{oauth2Token, rawUserInfos}

//		data, err := json.MarshalIndent(resp, "", "    ")
//		if err != nil {
//			http.Error(c.Writer, err.Error(), http.StatusInternalServerError)
//			return
//		}

//		expiryTime := time.Duration(utils.JWTExpiryDuration) * 60
                setJWTCookie(c, "token", token)
                c.Redirect(http.StatusFound, "/")
        }
}

func CreateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)

		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		if userRequest.Role == "" || userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Assigning UID to user
		uID := uuid.Must(uuid.NewRandom()).String()
		userRequest.ID = uID

		// Generating password hash
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), utils.PasswordEncryptionCost)
		if err != nil {
			log.Println("Error generating password")
		}
		password := string(hashedPassword)
		userRequest.Password = password

		createdAt := strconv.FormatInt(time.Now().Unix(), 10)
		userRequest.CreatedAt = &createdAt

		userResponse, err := service.CreateUser(&userRequest)
		if err == utils.ErrUserExists {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserExists], presenter.CreateErrorResponse(utils.ErrUserExists))
			return
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(200, userResponse)
	}
}
func UpdateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.UserDetails
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		uid := c.MustGet("uid").(string)
		userRequest.ID = uid

		// Checking if password is updated
		if userRequest.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), utils.PasswordEncryptionCost)
			if err != nil {
				return
			}
			userRequest.Password = string(hashedPassword)
		}

		err = service.UpdateUser(&userRequest)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
		}
		c.JSON(200, gin.H{"message": "User details updated successfully"})
	}
}

// GetUser returns the user that matches the uid passed in parameter
func GetUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("uid")
		user, err := service.GetUser(uid)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}
		c.JSON(200, user)
	}
}

func FetchUsers(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, users)
	}
}

func LoginUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		if userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Checking if user exists
		user, err := service.FindUser(userRequest.UserName)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		// Checking if user is deactivated
		if user.DeactivatedAt != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserDeactivated], presenter.CreateErrorResponse(utils.ErrUserDeactivated))
			return
		}

		// Validating password
		err = service.CheckPasswordHash(user.Password, userRequest.Password)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}

		token, err := user.GetSignedJWT()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		expiryTime := time.Duration(utils.JWTExpiryDuration) * 60
		c.JSON(200, gin.H{
			"access_token": token,
			"expires_in":   expiryTime,
			"type":         "Bearer",
		})
	}
}

func UpdatePassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		username := c.MustGet("username").(string)
		userPasswordRequest.Username = username
		if utils.StrictPasswordPolicy {
			err := utils.ValidateStrictPassword(userPasswordRequest.NewPassword)
			if err != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrStrictPasswordPolicyViolation], presenter.CreateErrorResponse(utils.ErrStrictPasswordPolicyViolation))
				return
			}
		}
		if userPasswordRequest.NewPassword == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, true)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset",
		})
	}
}

func ResetPassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		uid := c.MustGet("uid").(string)
		var adminUser entities.User
		adminUser.UserName = c.MustGet("username").(string)
		adminUser.ID = uid
		if utils.StrictPasswordPolicy {
			err := utils.ValidateStrictPassword(userPasswordRequest.NewPassword)
			if err != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrStrictPasswordPolicyViolation], presenter.CreateErrorResponse(utils.ErrStrictPasswordPolicyViolation))
				return
			}
		}
		if userPasswordRequest.Username == "" || userPasswordRequest.NewPassword == "" {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, false)
		if err != nil {
			log.Error(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset successfully",
		})
	}
}

func UpdateUserState(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.UpdateUserState
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		var adminUser entities.User
		adminUser.UserName = c.MustGet("username").(string)
		adminUser.ID = c.MustGet("uid").(string)

		// Checking if loggedIn user is admin
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		// Checking if user exists
		user, err := service.FindUser(userRequest.Username)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		// Checking if updated user is admin
		if user.Role == entities.RoleAdmin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUpdatingAdmin], presenter.CreateErrorResponse(utils.ErrUpdatingAdmin))
			return
		}

		// Checking if user is already deactivated
		if userRequest.IsDeactivate {
			if user.DeactivatedAt != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrUserAlreadyDeactivated], presenter.CreateErrorResponse(utils.ErrUserAlreadyDeactivated))
				return
			}
		}

		err = service.UpdateUserState(userRequest.Username, userRequest.IsDeactivate)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"message": "user's state updated successfully",
		})
	}
}
