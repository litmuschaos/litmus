package github

import (
	"context"
	"net/http"

	"golang.org/x/oauth2"
	githubAuth "golang.org/x/oauth2/github"
)

var (
	config = oauth2.Config{
		ClientID:     "3a6b324047494810c849",
		ClientSecret: "6671f33aa589f324a2491ae418ff2706f997b991",
		Scopes:       []string{"read:user", "user:email"},
		RedirectURL:  "http://localhost:3000/oauth/github",
		Endpoint:     githubAuth.Endpoint,
	}
	globalToken *oauth2.Token // Non-concurrent security
)

//Middleware redirects to a github endpoint to get the temp code for oauth
func Middleware(w http.ResponseWriter, r *http.Request) {
	u := config.AuthCodeURL("xyz")
	http.Redirect(w, r, u, http.StatusFound)
}

//GitHub gets the temp code for oauth and exchanges this code with github in order to get auth token
func GitHub(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	state := r.Form.Get("state")
	if state != "xyz" {
		http.Error(w, "State invalid", http.StatusBadRequest)
		return
	}
	code := r.Form.Get("code")
	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}
	token, err := config.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	globalToken = token
}
