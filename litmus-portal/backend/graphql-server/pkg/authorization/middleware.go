package authorization

import (
	"context"
	"net/http"
)

type contextKey string

const AuthKey = contextKey("authorization")

func Middleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		ctx := context.WithValue(r.Context(), AuthKey, auth)
		r = r.WithContext(ctx)
		handler.ServeHTTP(w, r)
	})
}
