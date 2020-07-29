package generates

import (
	"fmt"
	"strings"
	"time"

	errs "errors"

	"github.com/dgrijalva/jwt-go"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/errors"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
)

// JWTAccessClaims jwt claims
type JWTAccessClaims struct {
	*models.PublicUserInfo
	jwt.StandardClaims
}

// NewJWTAccessGenerate create to generate the jwt access token instance
func NewJWTAccessGenerate(key []byte, method jwt.SigningMethod) *JWTAccessGenerate {
	return &JWTAccessGenerate{
		SignedKey:    key,
		SignedMethod: method,
	}
}

// GenerateBasic provide the basis of the generated token data
type GenerateBasic struct {
	UserInfo  *models.PublicUserInfo
	CreateAt  *time.Time
	TokenInfo *models.Token
}

// JWTAccessGenerate generate the jwt access token
type JWTAccessGenerate struct {
	SignedKey    []byte
	SignedMethod jwt.SigningMethod
}

// Token based on the UUID generated token
func (a *JWTAccessGenerate) Token(data *GenerateBasic) (string, error) {
	claims := &JWTAccessClaims{
		PublicUserInfo: data.UserInfo,
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  time.Now().Unix(),
			ExpiresAt: data.TokenInfo.GetAccessCreateAt().Add(data.TokenInfo.GetAccessExpiresIn()).Unix(),
		},
	}
	token := jwt.NewWithClaims(a.SignedMethod, claims)
	var key interface{}
	if a.isEs() {
		v, err := jwt.ParseECPrivateKeyFromPEM(a.SignedKey)
		if err != nil {
			return "", err
		}
		key = v
	} else if a.isRsOrPS() {
		v, err := jwt.ParseRSAPrivateKeyFromPEM(a.SignedKey)
		if err != nil {
			return "", err
		}
		key = v
	} else if a.isHs() {
		key = a.SignedKey
	} else {
		return "", errs.New("unsupported sign method")
	}

	access, err := token.SignedString(key)
	if err != nil {
		return "", err
	}
	return access, nil
}

func (a *JWTAccessGenerate) isEs() bool {
	return strings.HasPrefix(a.SignedMethod.Alg(), "ES")
}

func (a *JWTAccessGenerate) isRsOrPS() bool {
	isRs := strings.HasPrefix(a.SignedMethod.Alg(), "RS")
	isPs := strings.HasPrefix(a.SignedMethod.Alg(), "PS")
	return isRs || isPs
}

func (a *JWTAccessGenerate) isHs() bool {
	return strings.HasPrefix(a.SignedMethod.Alg(), "HS")
}

// Validate validates  the token
func (a *JWTAccessGenerate) Validate(tokenString string) (bool, error) {

	token, err := a.parseToken(tokenString)
	if err != nil {
		return false, err
	}

	return token.Valid, nil
}

// Parse parses a UserName from a token
func (a *JWTAccessGenerate) Parse(tokenString string) (*models.PublicUserInfo, error) {

	token, err := a.parseToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTAccessClaims); ok && token.Valid {
		return claims.PublicUserInfo, nil
	}
	return nil, errors.ErrInvalidAccessToken
}

func (a *JWTAccessGenerate) parseToken(tokenString string) (*jwt.Token, error) {
	return jwt.ParseWithClaims(tokenString, &JWTAccessClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validating the signing method
		if ok := token.Method.Alg() == a.SignedMethod.Alg(); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(types.DefaultAPISecret), nil
	})
}
