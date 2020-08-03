package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	glog "github.com/golang/glog"
	"github.com/google/go-github/github"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/generates"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/manage"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
	"golang.org/x/oauth2"
	githubAuth "golang.org/x/oauth2/github"
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
	Config      *Config
	Manager     *manage.Manager
	globalToken *oauth2.Token
	config      oauth2.Config
}

//var sGit *Server

//Middleware redirects to a github endpoint to get the temp code for oauth
func (s *Server) Middleware(c *gin.Context) {
	s.config = oauth2.Config{
		ClientID:     "ef1f3bef5f901dec6c9d",
		ClientSecret: "2723a84e77bae8602e45259cc07c6af85a9dc3ca",
		Scopes:       []string{"read:user", "user:email"},
		RedirectURL:  "http://localhost:3000/oauth/github",
		Endpoint:     githubAuth.Endpoint,
	}
	//log.Println(s.config.ClientID)
	var w http.ResponseWriter = c.Writer
	var r *http.Request = c.Request
	u := s.config.AuthCodeURL("xyz")
	http.Redirect(w, r, u, http.StatusFound)
}

//GitHub gets the temp code for oauth and exchanges this code with github in order to get auth token
func (s *Server) GitHub(c *gin.Context) {
	var w http.ResponseWriter = c.Writer
	var r *http.Request = c.Request
	r.ParseForm()
	state := r.Form.Get("state")
	log.Println(state)
	if state != "xyz" {
		http.Error(w, "State invalid", http.StatusBadRequest)
		return
	}
	code := r.Form.Get("code")
	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}
	token, err := s.config.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.globalToken = token
	fmt.Println(s.globalToken)
	githubData := s.getGithubData()

	log.Println(githubData)

}

func (s *Server) getGithubData() string {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(s.globalToken)
	tc := oauth2.NewClient(ctx, ts)

	client := github.NewClient(tc)

	user, _, err := client.Users.Get(ctx, "")

	if err != nil {
		fmt.Printf("\nerror: %v\n", err)

	}

	fmt.Printf("\n%v\n", github.Stringify(user))
	return github.Stringify(user)
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
	glog.Infoln("Internal Error:", err.Error())
	return
}

func (s *Server) responseErrorHandler(re *errors.Response) {
	glog.Infoln("Response Error:", re.Error.Error())
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
