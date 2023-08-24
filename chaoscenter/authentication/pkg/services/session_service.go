package services

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	log "github.com/sirupsen/logrus"
)

// SessionService is the interface for SessionService
type sessionService interface {
	RevokeToken(tokenString string) error
	ValidateToken(encodedToken string) (*jwt.Token, error)
	GetSignedJWT(user *entities.User) (string, error)
}

// RevokeToken revokes the given JWT Token
func (a applicationService) RevokeToken(tokenString string) error {
	token, err := a.parseToken(tokenString)
	if err != nil {
		return err
	}
	claims := token.Claims.(jwt.MapClaims)
	revokedToken := &entities.RevokedToken{
		Token:     tokenString,
		ExpiresAt: int64(claims["exp"].(float64)),
		CreatedAt: time.Now().Unix(),
	}
	return a.sessionRepository.RevokeToken(revokedToken)
}

// ValidateToken validates the given JWT Token
func (a applicationService) ValidateToken(encodedToken string) (*jwt.Token, error) {
	parsedToken, err := a.parseToken(encodedToken)
	if err != nil {
		return nil, err
	}
	if a.isTokenRevoked(parsedToken.Raw) {
		return &jwt.Token{Valid: false}, fmt.Errorf("token revoked")
	}
	return parsedToken, err
}

// isTokenRevoked checks if the given JWT Token is revoked
func (a applicationService) isTokenRevoked(encodedToken string) bool {
	return a.sessionRepository.IsTokenRevoked(encodedToken)
}

// parseToken parses the given JWT Token
func (a applicationService) parseToken(encodedToken string) (*jwt.Token, error) {
	return jwt.Parse(encodedToken, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
		}
		return []byte(utils.JwtSecret), nil
	})
}

// GetSignedJWT generates the JWT Token for the user object
func (a applicationService) GetSignedJWT(user *entities.User) (string, error) {
	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = user.ID
	claims["role"] = user.Role
	claims["username"] = user.Username
	claims["exp"] = time.Now().Add(time.Minute * time.Duration(utils.JWTExpiryDuration)).Unix()

	tokenString, err := token.SignedString([]byte(utils.JwtSecret))
	if err != nil {
		log.Info(err)
		return "", err
	}

	return tokenString, nil
}
