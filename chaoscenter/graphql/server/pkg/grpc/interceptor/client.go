package interceptor

import (
	"context"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/golang-jwt/jwt"
	jwt4 "github.com/golang-jwt/jwt/v4"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

type ClientAuthInterceptor struct {
	authMethods map[string]bool
	secretKey   string
}

func NewClientAuthInterceptor(secretKey string, authMethods map[string]bool) *ClientAuthInterceptor {
	return &ClientAuthInterceptor{
		authMethods: authMethods,
		secretKey:   secretKey,
	}
}

func (interceptor *ClientAuthInterceptor) Unary() grpc.UnaryClientInterceptor {
	return func(
		ctx context.Context,
		method string,
		req, reply interface{},
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption,
	) error {
		if interceptor.authMethods[method] {
			token, err := GenerateJWT(interceptor.secretKey)
			if err != nil {
				log.Errorf("failed to generate jwt token: %v", err)
				token = ""
			}
			return invoker(interceptor.attachToken(ctx, token), method, req, reply, cc, opts...)
		}
		return invoker(ctx, method, req, reply, cc, opts...)
	}
}

func (interceptor *ClientAuthInterceptor) attachToken(ctx context.Context, token string) context.Context {
	return metadata.AppendToOutgoingContext(ctx, "authorization", token)
}

type harnessClaims struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt4.RegisteredClaims
}

func GenerateJWT(jwtSecret string) (string, error) {
	var (
		tokenTypeService = "SERVICE"
		tokenIssuer      = "Harness Inc"
	)

	// Valid from a minute ago
	issuedTime := jwt4.NewNumericDate(time.Now().Add(-time.Minute))

	// Expires in a minute from now
	expiryTime := jwt4.NewNumericDate(time.Now().Add(time.Minute))

	harnessClaims := harnessClaims{
		Type: tokenTypeService,
		Name: "Chaos",
	}

	harnessClaims.Issuer = tokenIssuer
	harnessClaims.IssuedAt = issuedTime
	harnessClaims.NotBefore = issuedTime
	harnessClaims.ExpiresAt = expiryTime

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, harnessClaims)
	signedJwt, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return signedJwt, nil
}
