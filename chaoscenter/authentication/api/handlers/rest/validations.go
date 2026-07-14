package rest

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
)

func CheckInitialLogin(applicationService services.ApplicationService, userID string) (bool, error) {
	user, err := applicationService.GetUser(userID)
	if err != nil {
		return false, err
	}
	if user.IsInitialLogin {
		return true, nil
	} else {
		return false, nil
	}
}
