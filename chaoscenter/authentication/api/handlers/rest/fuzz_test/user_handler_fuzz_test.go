package rest_fuzz_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"
	"unicode/utf8"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/mock"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

func GetTestGinContext(w *httptest.ResponseRecorder) *gin.Context {
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = &http.Request{
		Header: make(http.Header),
		URL:    &url.URL{},
	}

	return ctx
}

func FuzzCreateUser(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := entities.User{}
		err := fuzzConsumer.GenerateStruct(&targetStruct)
		if err != nil {
			return
		}
		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		if targetStruct.Role == "" || targetStruct.Username == "" || targetStruct.Password == "" {
			// Simulate CreateUser behaviour for invalid input data
			mockService.On("CreateUser", mock.AnythingOfType("*entities.User")).Return(nil, errors.New("invalid user data"))
		} else {
			mockService.On("CreateUser", mock.AnythingOfType("*entities.User")).Return(targetStruct, nil)
		}

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "admin")

		b, _ := json.Marshal(targetStruct)
		c.Request = httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(b))

		// Call the handler
		rest.CreateUser(mockService)(c)

		// Check response code
		expectedCode := http.StatusOK
		if targetStruct.Role == "" || targetStruct.Username == "" || targetStruct.Password == "" {
			expectedCode = utils.ErrorStatusCodes[utils.ErrInvalidRequest]
		}
		if w.Code != expectedCode {
			t.Errorf("CreateUser handler returned status code %d, expected %d", w.Code, expectedCode)
		}
		//if the response code is OK, unmarshals the response body to verify
		if w.Code == http.StatusOK {
			var response entities.User
			if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}
		}
	})
}

func FuzzUpdateUser(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := entities.UserDetails{}
		err := fuzzConsumer.GenerateStruct(&targetStruct)
		if err != nil {
			return
		}

		// Check if the generated user data is empty
		if targetStruct.ID == "" {
			t.Skip("Empty user data generated, skipping test")
		}

		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		mockService.On("UpdateUser", mock.AnythingOfType("*entities.UserDetails")).Return(nil)

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("uid", "testUID")

		b, _ := json.Marshal(targetStruct)
		c.Request = httptest.NewRequest(http.MethodPost, "/path", bytes.NewBuffer(b))

		// Call the handler
		rest.UpdateUser(mockService)(c)

		// Check response code and for nil response
		if w.Code != http.StatusOK {
			t.Errorf("UpdateUser handler returned status code %d, expected %d", w.Code, http.StatusOK)
		}
		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		expectedMsg := "User details updated successfully"
		if response["message"] != expectedMsg {
			t.Errorf("UpdateUser handler returned message %v, expected %v", response["message"], expectedMsg)
		}
	})
}

func FuzzGetUser(f *testing.F) {
	f.Fuzz(func(t *testing.T, targetUID string) {

		// Check if the generated user data is empty or contains invalid UTF-8 characters
		if targetUID == "" || !utf8.ValidString(targetUID) {
			t.Skip("Empty or invalid data generated, skipping test")
		}

		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		mockUser := &entities.User{
			ID:       targetUID,
			Username: "testUser",
			Email:    "test@example.com",
		}
		mockService.On("GetUser", targetUID).Return(mockUser, nil)

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "uid", Value: targetUID},
		}

		// Call the handler
		rest.GetUser(mockService)(c)

		// Check response code and response
		if w.Code != http.StatusOK {
			t.Errorf("GetUser handler returned status code %d, expected %d", w.Code, http.StatusOK)
		}
		if w.Code == http.StatusOK {
			var user entities.User
			if err := json.Unmarshal(w.Body.Bytes(), &user); err != nil {
				t.Errorf("Failed to unmarshal response: %v", err)
			}
			if user.ID != targetUID {
				t.Errorf("Expected user ID %s, got %s", targetUID, user.ID)
			}
		}
	})
}

func FuzzFetchUsers(f *testing.F) {
	f.Fuzz(func(t *testing.T, role string) {

		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		if role == "admin" {
			mockService.On("GetUsers").Return(mock.AnythingOfType("*[]entities.User"), nil)
		} else {
			// Mock service to return error for non-admin roles
			mockService.On("GetUsers").Return(nil, errors.New("unauthorized"))
		}

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", role)

		// Call the handler
		rest.FetchUsers(mockService)(c)

		// Define the expected code based on the role
		var expectedCode int
		if role == "admin" {
			expectedCode = http.StatusOK
		} else {
			expectedCode = utils.ErrorStatusCodes[utils.ErrUnauthorized]
		}

		if expectedCode != w.Code {
			t.Errorf("FetchUsers handler returned status code %d, expected %d", w.Code, expectedCode)
		}
	})
}

func FuzzInviteUsers(f *testing.F) {
	f.Fuzz(func(t *testing.T, projectID string) {

		// Check if the generated data is empty or contains invalid UTF-8 characters
		if projectID == "" || !utf8.ValidString(projectID) {
			t.Skip("Empty or invalid data generated, skipping test")
		}

		// Define a mock slice of members
		mockMembers := []*entities.Member{
			{UserID: "user1ID"},
			{UserID: "user2ID"},
		}
		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		// Mock the GetProjectMembers function to return the mock members
		mockService.On("GetProjectMembers", projectID, "all").Return(mockMembers, nil)

		// Define the list of user IDs
		uids := []string{"user1ID", "user2ID"}

		// Define a mock slice of users
		mockUsers := &[]entities.User{
			{ID: "user1ID", Username: "user1"},
			{ID: "user2ID", Username: "user2"},
		}

		// Mock the InviteUsers function to return the mock users
		mockService.On("InviteUsers", uids).Return(mockUsers, nil)

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Params = gin.Params{
			{Key: "project_id", Value: projectID},
		}

		// Call the handler
		rest.InviteUsers(mockService)(c)

		// Define the expected HTTP status code
		expectedCode := http.StatusOK
		if w.Code != expectedCode {
			t.Errorf("InviteUsers handler returned status code %d, expected %d", w.Code, expectedCode)
		}
	})
}

func FuzzLogoutUser(f *testing.F) {
	f.Fuzz(func(t *testing.T, givenToken string) {
		// Check if the generated token is empty or contains invalid UTF-8 characters
		if givenToken == "" || !utf8.ValidString(givenToken) {
			t.Skip("Empty or invalid token generated, skipping test")
		}

		// Mock service setup
		mockService := new(mocks.MockedApplicationService)
		// Mock the RevokeToken function to return nil, indicating successful token revocation
		mockService.On("RevokeToken", givenToken).Return(nil)

		// Mock Gin context setup
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Request.Header.Set("Authorization", givenToken)

		// Call the handler
		rest.LogoutUser(mockService)(c)

		// Define the expected HTTP status code and output message
		expectedCode := http.StatusOK
		expectedOutput := `{"message":"successfully logged out"}`

		// Check the actual HTTP status code and output message
		if w.Code != expectedCode {
			t.Errorf("LogoutUser handler returned status code %d, expected %d", w.Code, expectedCode)
		}
		if w.Body.String() != expectedOutput {
			t.Errorf("LogoutUser handler returned output %s, expected %s", w.Body.String(), expectedOutput)
		}
	})
}

// LoginUser fuzz test to be added

// func FuzzUpdatePassword(f *testing.F) {
// 	f.Fuzz(func(t *testing.T, data []byte) {
// 		fuzzConsumer := fuzz.NewConsumer(data)
// 		targetStruct := struct {
// 			OldPassword       string
// 			NewPassword       string
// 			GivenStrictPolicy bool
// 		}{}
// 		err := fuzzConsumer.GenerateStruct(&targetStruct)
// 		if err != nil {
// 			return
// 		}

// 		// Mock service setup
// 		mockService := new(mocks.MockedApplicationService)

// 		// Mock Gin context setup
// 		w := httptest.NewRecorder()
// 		c, _ := gin.CreateTestContext(w)
// 		body, _ := json.Marshal(targetStruct)
// 		c.Request = httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(body))
// 		c.Request.Header.Set("Content-Type", "application/json")

// 		// Set random username for the test
// 		username := "testUser"
// 		c.Set("username", username)

// 		// Set the strict password policy
// 		utils.StrictPasswordPolicy = targetStruct.GivenStrictPolicy

// 		// Mock UpdatePassword service response
// 		var givenServiceResponse error
// 		if targetStruct.OldPassword == targetStruct.NewPassword {
// 			givenServiceResponse = errors.New("old and new passwords are the same")
// 		} else if len(targetStruct.NewPassword) < 8 {
// 			givenServiceResponse = errors.New("new password is too short")
// 		} else {
// 			givenServiceResponse = nil // Simulate successful update
// 		}
// 		userPassword := entities.UserPassword{
// 			Username:    username,
// 			OldPassword: targetStruct.OldPassword,
// 			NewPassword: targetStruct.NewPassword,
// 		}
// 		mockService.On("UpdatePassword", &userPassword, true).Return(givenServiceResponse)

// 		// Call the handler
// 		rest.UpdatePassword(mockService)(c)

// 		// Define the expected HTTP status code and output
// 		expectedCode := http.StatusOK
// 		expectedOutput := `{"message":"password has been updated successfully"}`
// 		if givenServiceResponse != nil {
// 			expectedCode = utils.ErrorStatusCodes[utils.ErrInvalidCredentials]
// 			expectedOutput = `{"error":"password update failed"}`
// 		}

// 		// Check the actual HTTP status code and output message
// 		if w.Code != expectedCode {
// 			t.Errorf("UpdatePassword handler returned status code %d, expected %d", w.Code, expectedCode)
// 		}
// 		if w.Body.String() != expectedOutput {
// 			t.Errorf("UpdatePassword handler returned output %s, expected %s", w.Body.String(), expectedOutput)
// 		}
// 	})
// }
