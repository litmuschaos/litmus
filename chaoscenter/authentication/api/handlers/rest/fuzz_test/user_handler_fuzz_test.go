package rest_fuzz_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/mock"
)

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
			// Simulate CreateUser behavior for invalid input data
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

		// Check if the generated user data is empty
		if targetUID == "" {
			t.Skip("Empty data generated, skipping test")
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
