package authorization

import (
	"context"
	"net/http"
)

type contextKey string

const AuthKey = contextKey("authorization")

func Middleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jwt := ""
		auth, err := r.Cookie("token")
		if err == nil {
			jwt = auth.Value
		} else if r.Header.Get("Authorization") != "" {
			jwt = r.Header.Get("Authorization")
		}

		ctx := context.WithValue(r.Context(), AuthKey, jwt)
		r = r.WithContext(ctx)
		handler.ServeHTTP(w, r)
	})
}
