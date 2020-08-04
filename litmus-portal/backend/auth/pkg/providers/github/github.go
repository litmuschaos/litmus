package github

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/go-github/v32/github"
	"golang.org/x/oauth2"
	githubAuth "golang.org/x/oauth2/github"
)

var (
	config = oauth2.Config{
		ClientID:     os.Getenv("ClientID"),
		ClientSecret: os.Getenv("ClientSecret"),
		Scopes:       []string{"read:user", "user:email"},
		RedirectURL:  "http://localhost:3000/oauth/github",
		Endpoint:     githubAuth.Endpoint,
	}
	globalToken *oauth2.Token // Non-concurrent security
)

//Middleware redirects to a github endpoint to get the temp code for oauth
func Middleware(c *gin.Context) {
	var w http.ResponseWriter = c.Writer
	var r *http.Request = c.Request
	u := config.AuthCodeURL("xyz")
	http.Redirect(w, r, u, http.StatusFound)
}

//GitHub gets the temp code for oauth and exchanges this code with github in order to get auth token
func GitHub(c *gin.Context) {
	var w http.ResponseWriter = c.Writer
	var r *http.Request = c.Request
	r.ParseForm()
	state := r.Form.Get("state")
	fmt.Println(state)
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
	fmt.Println(globalToken)
	githubData := getGithubData()

	log.Println(githubData)

}

func getGithubData() string {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(globalToken)
	tc := oauth2.NewClient(ctx, ts)

	client := github.NewClient(tc)

	user, _, err := client.Users.Get(ctx, "")

	if err != nil {
		fmt.Printf("\nerror: %v\n", err)

	}

	fmt.Printf("\n%v\n", github.Stringify(user))
	return github.Stringify(user)
}
