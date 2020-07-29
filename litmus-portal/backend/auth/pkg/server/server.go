package server

import (
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/generates"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/manage"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
)

// NewServer create authorization server
func NewServer(cfg *Config) *Server {

	manager := manage.NewManager()

	userStoreCfg := store.NewConfig(types.DefaultDBServerURL, types.DefaultAuthDB)

	manager.MustUserStorage(store.NewUserStore(userStoreCfg, store.NewDefaultUserConfig()))

	manager.MapAccessGenerate(generates.NewJWTAccessGenerate([]byte(types.DefaultAPISecret), jwt.SigningMethodHS512))

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

func (s *Server) redirectError(c *gin.Context, err error) {
	data, _, _ := s.getErrorData(err)
	c.JSON(http.StatusUnauthorized, data)
}

func (s *Server) redirect(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, data)
}

// ValidationAuthenticateRequest the authenticate request validation
func (s *Server) validationAuthenticateRequest(user *models.User) (*manage.TokenGenerateRequest, error) {
	username := user.GetUserName()
	password := user.GetPassword()
	if username == "" || password == "" {
		return nil, errors.ErrInvalidRequest
	}

	userInfo, err := s.Manager.VerifyUserPassword(username, password)
	if err != nil {
		return nil, err
	}

	req := &manage.TokenGenerateRequest{
		UserInfo: userInfo,
	}
	return req, nil
}

// HandleAuthenticateRequest the authorization request handling
func (s *Server) HandleAuthenticateRequest(c *gin.Context, user *models.User) {

	tgr, err := s.validationAuthenticateRequest(user)
	if err != nil {
		s.redirectError(c, err)
		return
	}

	ti, err := s.Manager.GenerateAuthToken(tgr)
	if err != nil {
		s.redirectError(c, err)
		return
	}

	s.redirect(c, s.getTokenData(ti))
	return
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

// UpdateRequest validates the request
func (s *Server) UpdateRequest(c *gin.Context, user *models.User) {

	tokenString, err := s.getTokenFromHeader(c.Request)
	if err != nil {
		s.redirectError(c, err)
		return
	}

	userInfo, err := s.Manager.ParseToken(tokenString)
	if err != nil {
		s.redirectError(c, err)
		return
	}

	user.UserName = userInfo.GetUserName()
	updatedUserInfo, err := s.Manager.UpdateUserDetails(user)
	if err != nil {
		s.redirectError(c, err)
		return
	}
	s.redirect(c, updatedUserInfo)
	return
}
