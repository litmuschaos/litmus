package server

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/manage"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
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
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusUnauthorized)
	return s.redirect(w, data)
}

func (s *Server) redirect(w http.ResponseWriter, data interface{}) error {

	response, err := json.Marshal(data)
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_, err = w.Write(response)
	return err
}

// ValidationAuthenticateRequest the authenticate request validation
func (s *Server) validationAuthenticateRequest(r *http.Request) (*manage.TokenGenerateRequest, error) {
	if !(r.Method == "GET" || r.Method == "POST") {
		return nil, errors.ErrInvalidRequest
	}

	userID, password := r.FormValue("username"), r.FormValue("password")
	if userID == "" || password == "" {
		return nil, errors.ErrInvalidRequest
	}

	userInfo, err := s.Manager.VerifyUserPassword(userID, password)
	if err != nil {
		return nil, err
	}

	req := &manage.TokenGenerateRequest{
		UserInfo: userInfo,
		Request:  r,
	}
	return req, nil
}

// HandleAuthenticateRequest the authorization request handling
func (s *Server) HandleAuthenticateRequest(w http.ResponseWriter, r *http.Request) error {
	ctx := r.Context()

	tgr, err := s.validationAuthenticateRequest(r)
	if err != nil {
		return s.redirectError(w, err)
	}

	ti, err := s.Manager.GenerateAuthToken(ctx, tgr)
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
	return s.redirect(w, user.GetPublicInfo())
}

// UpdateRequest validates the request
func (s *Server) UpdateRequest(w http.ResponseWriter, r *http.Request) (err error) {

	tokenString, err := s.getTokenFromHeader(r)
	if err != nil {
		return s.redirectError(w, err)
	}

	userInfo, err := s.Manager.ParseToken(r.Context(), tokenString)
	if err != nil {
		return s.redirectError(w, err)
	}

	updatedUserInfo, err := s.Manager.UpdateUserDetails(r, userInfo.UserName)
	if err != nil {
		s.redirectError(w, err)
	}
	return s.redirect(w, updatedUserInfo)
}
