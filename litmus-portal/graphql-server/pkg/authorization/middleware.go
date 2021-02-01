package authorization

import (
	"context"
	"fmt"
	"net/http"
)

type contextKey string

const (
	AuthKey    = contextKey("authorization")
	UserClaim  = contextKey("user-claims")
	CookieName = "token"
)

func Middleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jwt := ""
		auth, err := r.Cookie(CookieName)
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

// RestMiddleware ...
func RestMiddleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jwt := ""
		auth, err := r.Cookie(CookieName)
		fmt.Println("auth: ", auth)
		if err == nil {
			jwt = auth.Value
			fmt.Println("jwt: ", jwt)
		} else if r.Header.Get("Authorization") != "" {
			jwt = r.Header.Get("Authorization")
		}
		_, err = UserValidateJWT(jwt)
		if err != nil {
			fmt.Println("Error in Cookie: ", err)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Error verifying JWT token: " + err.Error()))
			return
		}

		handler.ServeHTTP(w, r)
	})
}
