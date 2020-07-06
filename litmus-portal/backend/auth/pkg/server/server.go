package server

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	log "github.com/golang/glog"
	"golang.org/x/crypto/bcrypt"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/manage"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
)

// NewDefaultServer create a default authorization server
func NewDefaultServer(manager *manage.Manager) *Server {
	return NewServer(NewConfig(), manager)
}

// NewServer create authorization server
func NewServer(cfg *Config, manager *manage.Manager) *Server {
	srv := &Server{
		Config:  cfg,
		Manager: manager,
	}

	return srv
}

// Server Provide authorization server
type Server struct {
	Config  *Config
	Manager *manage.Manager
}

func (s *Server) redirectError(w http.ResponseWriter, err error) error {
	data, _, _ := s.getErrorData(err)
	return s.redirect(w, data)
}

func (s *Server) redirect(w http.ResponseWriter, data map[string]interface{}) error {
	uri, err := s.getRedirectURI(data)
	if err != nil {
		return err
	}

	w.Header().Set("Location", uri)
	w.WriteHeader(302)
	return nil
}

// GetRedirectURI get redirect uri
func (s *Server) getRedirectURI(data map[string]interface{}) (string, error) {
	u, err := url.Parse(types.RedirectURI)
	if err != nil {
		return "", err
	}

	q := u.Query()

	for k, v := range data {
		q.Set(k, fmt.Sprint(v))
	}

	u.RawQuery = ""
	fragment, err := url.QueryUnescape(q.Encode())
	if err != nil {
		return "", err
	}
	u.Fragment = fragment

	return u.String(), nil
}

// ValidationAuthenticateRequest the authenticate request validation
func (s *Server) validationAuthenticateRequest(r *http.Request) (*AuthenticateRequest, error) {
	if !(r.Method == "GET" || r.Method == "POST") {
		return nil, errors.ErrInvalidRequest
	}

	userID, password := r.FormValue("username"), r.FormValue("password")
	if userID == "" || password == "" {
		return nil, errors.ErrInvalidRequest
	}

	userID, err := s.passwordAuthenticationHandler(userID, password)
	if err != nil {
		return nil, err
	} else if userID == "" {
		return nil, errors.ErrInvalidUser
	}

	req := &AuthenticateRequest{
		UserID:  userID,
		Request: r,
	}
	return req, nil
}

// getAuthenticationToken get authentication token(code)
func (s *Server) getAuthenticationToken(ctx context.Context, req *AuthenticateRequest) (*models.Token, error) {

	tgr := &manage.TokenGenerateRequest{
		UserID:         req.UserID,
		AccessTokenExp: req.AccessTokenExp,
		Request:        req.Request,
	}
	return s.Manager.GenerateAuthToken(ctx, tgr)
}

// HandleAuthenticateRequest the authorization request handling
func (s *Server) HandleAuthenticateRequest(w http.ResponseWriter, r *http.Request) error {
	ctx := r.Context()

	req, err := s.validationAuthenticateRequest(r)
	if err != nil {
		return s.redirectError(w, err)
	}

	ti, err := s.getAuthenticationToken(ctx, req)
	if err != nil {
		return s.redirectError(w, err)
	}

	return s.redirect(w, s.getTokenData(ti))
}

// GetTokenData token data
func (s *Server) getTokenData(ti *models.Token) map[string]interface{} {
	data := map[string]interface{}{
		"access_token": ti.GetAccess(),
		"token_type":   s.Config.TokenType,
		"expires_in":   int64(ti.GetAccessExpiresIn() / time.Second),
	}
	return data
}

// GetErrorData get error response data
func (s *Server) getErrorData(err error) (map[string]interface{}, int, http.Header) {
	var re errors.Response
	if v, ok := errors.Descriptions[err]; ok {
		re.Error = err
		re.Description = v
		re.StatusCode = errors.StatusCodes[err]
	} else {
		if fn := s.internalErrorHandler; fn != nil {
			if v := fn(err); v != nil {
				re = *v
			}
		}

		if re.Error == nil {
			re.Error = errors.ErrServerError
			re.Description = errors.Descriptions[errors.ErrServerError]
			re.StatusCode = errors.StatusCodes[errors.ErrServerError]
		}
	}

	if fn := s.responseErrorHandler; fn != nil {
		fn(&re)
	}

	data := make(map[string]interface{})
	if err := re.Error; err != nil {
		data["error"] = err.Error()
	}

	if v := re.ErrorCode; v != 0 {
		data["error_code"] = v
	}

	if v := re.Description; v != "" {
		data["error_description"] = v
	}

	if v := re.URI; v != "" {
		data["error_uri"] = v
	}

	statusCode := http.StatusInternalServerError
	if v := re.StatusCode; v > 0 {
		statusCode = v
	}

	return data, statusCode, re.Header
}

func (s *Server) passwordAuthenticationHandler(username, password string) (string, error) {
	var err error

	user, err := s.Manager.GetUser(context.TODO(), username)
	if err != nil {
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.GetPassword()), []byte(password))
	return username, err
}

func (s *Server) internalErrorHandler(err error) (re *errors.Response) {
	log.Infoln("Internal Error:", err.Error())
	return
}

func (s *Server) responseErrorHandler(re *errors.Response) {
	log.Infoln("Response Error:", re.Error.Error())
}

func (s *Server) getTokenFromHeader(r *http.Request) (string, error) {
	auth := r.Header.Get("Authorization")
	prefix := "Bearer "
	token := ""

	if auth != "" && strings.HasPrefix(auth, prefix) {
		token = auth[len(prefix):]
	}

	if token == "" {
		return "", errors.ErrInvalidAccessToken
	}

	return token, nil
}

//SignupRequest creates a user
func (s *Server) SignupRequest(w http.ResponseWriter, r *http.Request) (err error) {
	password, username := r.FormValue("password"), r.FormValue("username")
	if username == "" || password == "" {
		return s.redirectError(w, errors.ErrInvalidRequest)
	}
	user := &models.User{
		UserName: username,
		Password: password,
	}
	if err = s.Manager.CreateUser(r.Context(), user); err != nil {
		return s.redirectError(w, err)
	}
	return s.redirect(w, s.getUserData(user))
}

// UpdateRequest validates the request
func (s *Server) UpdateRequest(w http.ResponseWriter, r *http.Request) (err error) {

	tokenString, err := s.getTokenFromHeader(r)
	if err != nil {
		return s.redirectError(w, err)
	}

	username, err := s.Manager.ParseToken(r.Context(), tokenString)
	if err != nil {
		return s.redirectError(w, err)
	}

	user, err := s.Manager.UpdateUserDetails(r, username)
	if err != nil {
		s.redirectError(w, err)
	}
	return s.redirect(w, s.getUserData(user))
}

func (s *Server) getUserData(user *models.User) map[string]interface{} {
	data := map[string]interface{}{
		"username": user.GetUserName(),
		"email":    user.GetEmail(),
		"name":     user.GetName(),
	}
	return data
}
