package interceptor

import (
	"context"

	"github.com/golang-jwt/jwt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type ServerAuthInterceptor struct {
	Secret string
}

func NewServerAuthInterceptor(secret string) *ServerAuthInterceptor {
	return &ServerAuthInterceptor{
		Secret: secret,
	}
}

func (interceptor *ServerAuthInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		err := interceptor.authorize(ctx, info.FullMethod, interceptor.Secret)
		if err != nil {
			return nil, err
		}

		return handler(ctx, req)
	}
}

func (interceptor *ServerAuthInterceptor) authorize(ctx context.Context, method, secret string) error {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return status.Errorf(codes.Unauthenticated, "metadata is not provided")
	}

	values := md["authorization"]
	if len(values) == 0 {
		return status.Errorf(codes.Unauthenticated, "authorization token is not provided")
	}
	token := values[0]

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, status.Errorf(codes.Unauthenticated, "invalid authorization token")

		}
		return []byte(secret), nil
	})

	if err != nil {
		return status.Errorf(codes.Unauthenticated, "failed to parse token, %v", err.Error())
	}

	if !parsedToken.Valid {
		return status.Errorf(codes.Unauthenticated, "invalid authorization token")
	}

	return nil
}
