package rest

import (
	"context"
	"net/http"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
)

func oAuthDexConfig() (*oauth2.Config, *oidc.IDTokenVerifier, error) {
	ctx := oidc.ClientContext(context.Background(), &http.Client{})
	provider, err := oidc.NewProvider(ctx, utils.DexOIDCIssuer)
	if err != nil {
		log.Errorf("OAuth Error: Something went wrong with OIDC provider %s", err)
		return nil, nil, err
	}
	return &oauth2.Config{
		RedirectURL:  utils.DexCallBackURL,
		ClientID:     utils.DexClientID,
		ClientSecret: utils.DexClientSecret,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     provider.Endpoint(),
	}, provider.Verifier(&oidc.Config{ClientID: utils.DexClientID}), nil
}

// DexLogin handles and redirects to DexServer to proceed with OAuth
func DexLogin() gin.HandlerFunc {
	return func(c *gin.Context) {

		dexToken, err := utils.GenerateOAuthJWT()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		config, _, err := oAuthDexConfig()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		url := config.AuthCodeURL(dexToken)
		c.Redirect(http.StatusTemporaryRedirect, url)
	}
}

// DexCallback is the handler that creates/logs in the user from Dex and provides JWT to frontend via a redirect
func DexCallback(userService services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		incomingState := c.Query("state")
		validated, err := utils.ValidateOAuthJWT(incomingState)
		if !validated {
			c.Redirect(http.StatusTemporaryRedirect, "/")
		}
		config, verifier, err := oAuthDexConfig()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		token, err := config.Exchange(context.Background(), c.Query("code"))
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		rawIDToken, ok := token.Extra("id_token").(string)
		if !ok {
			log.Error("OAuth Error: no raw id_token found")
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		idToken, err := verifier.Verify(c, rawIDToken)
		if err != nil {
			log.Error("OAuth Error: no id_token found")
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		var claims struct {
			Name     string
			Email    string `json:"email"`
			Verified bool   `json:"email_verified"`
		}
		if err := idToken.Claims(&claims); err != nil {
			log.Error("OAuth Error: claims not found")
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		createdAt := time.Now().Unix()

		var userData = entities.User{
			Name:     claims.Name,
			Email:    claims.Email,
			UserName: claims.Email,
			Role:     entities.RoleUser,
			Audit: entities.Audit{
				CreatedAt: createdAt,
				UpdatedAt: createdAt,
			},
		}

		signedInUser, err := userService.LoginUser(&userData)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		jwtToken, err := signedInUser.GetSignedJWT()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.Redirect(http.StatusPermanentRedirect, "/login?jwtToken="+jwtToken)
	}
}
