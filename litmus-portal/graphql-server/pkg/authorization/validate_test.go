// Package authorization_test contains tests for the authorization package
package authorization_test

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestValidateRole tests the ValidateRole function
func TestValidateRole(t *testing.T) {
	// TODO: need to add test cases after mocking GRPC
}
