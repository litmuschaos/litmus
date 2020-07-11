package manage

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/globalsign/mgo"
	"golang.org/x/crypto/bcrypt"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/generates"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
)

// NewManager create to authorization management instance
func NewManager() *Manager {
	return &Manager{}
}

// Manager provide authorization management
type Manager struct {
	accessGenerate *generates.JWTAccessGenerate
	userStore      *store.UserStore
}

// MapAccessGenerate mapping the access token generate interface
func (m *Manager) MapAccessGenerate(gen *generates.JWTAccessGenerate) {
	m.accessGenerate = gen
}

// MustUserStorage mandatory mapping the user store interface
func (m *Manager) MustUserStorage(stor *store.UserStore, err error) {
	if err != nil {
		panic(err)
	}
	m.userStore = stor
	err = m.CreateUser(context.Background(), models.DefaultUser)
	if err != nil {
		log.Fatal("Unable to create default user with error:", err)
	}
}

// GetUser get the user information
func (m *Manager) GetUser(ctx context.Context, userName string) (user *models.User, err error) {
	user, err = m.userStore.GetByUserName(userName)
	if err != nil && err == mgo.ErrNotFound {
		err = errors.ErrInvalidUser
	}
	return
}

// CheckUserExists get the user information
func (m *Manager) CheckUserExists(ctx context.Context, userName string) (bool, error) {
	_, err := m.GetUser(ctx, userName)
	if err != nil && err == errors.ErrInvalidUser {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

// VerifyUserPassword verifies user password
func (m *Manager) VerifyUserPassword(username, password string) (*models.PublicUserInfo, error) {

	user, err := m.GetUser(context.TODO(), username)
	if err != nil {
		return nil, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.GetPassword()), []byte(password))
	return user.GetPublicInfo(), err
}

// CreateUser get the user information
func (m *Manager) CreateUser(ctx context.Context, user *models.User) (err error) {

	exists, err := m.CheckUserExists(ctx, user.UserName)
	if err != nil || exists {
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), types.PasswordEncryptionCost)
	if err != nil {
		return
	}
	user.Password = string(hashedPassword)
	err = m.userStore.Set(user)
	return
}

// GenerateAuthToken generate the authorization token(code)
func (m *Manager) GenerateAuthToken(ctx context.Context, tgr *TokenGenerateRequest) (*models.Token, error) {

	ti := models.NewToken()
	ti.SetUserID(tgr.UserInfo.GetUserName())

	createAt := time.Now()
	td := &generates.GenerateBasic{
		UserInfo:  tgr.UserInfo,
		CreateAt:  &createAt,
		TokenInfo: ti,
		Request:   tgr.Request,
	}

	cfg := DefaultTokenCfg
	aexp := cfg.AccessTokenExp
	if exp := tgr.AccessTokenExp; exp > 0 {
		aexp = exp
	}
	ti.SetAccessCreateAt(createAt)
	ti.SetAccessExpiresIn(aexp)

	tv, err := m.accessGenerate.Token(ctx, td)
	if err != nil {
		return nil, err
	}
	ti.SetAccess(tv)
	return ti, nil
}

// ValidateToken validates the token
func (m *Manager) ValidateToken(ctx context.Context, tokenString string) (valid bool, err error) {
	valid, err = m.accessGenerate.Validate(ctx, tokenString)
	return
}

// ParseToken validates the token
func (m *Manager) ParseToken(ctx context.Context, tokenString string) (userInfo *models.PublicUserInfo, err error) {
	userInfo, err = m.accessGenerate.Parse(ctx, tokenString)
	return
}

// UpdateUserDetails get the user information
func (m *Manager) UpdateUserDetails(r *http.Request, username string) (*models.PublicUserInfo, error) {

	password, email, name := r.FormValue("password"), r.FormValue("email"), r.FormValue("name")
	if password == "" {
		return nil, errors.ErrInvalidRequest
	}

	user, err := m.GetUser(r.Context(), username)
	if err != nil {
		return nil, err
	}

	hasehdPassword, err := bcrypt.GenerateFromPassword([]byte(password), types.PasswordEncryptionCost)
	if err != nil {
		return nil, err
	}

	user.Password = string(hasehdPassword)
	user.Email = email
	user.Name = name

	err = m.userStore.UpdateUser(user)
	return user.GetPublicInfo(), err
}
