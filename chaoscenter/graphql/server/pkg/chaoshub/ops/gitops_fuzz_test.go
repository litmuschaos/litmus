package chaoshubops

import (
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// FuzzGetClonePath is used to fuzz test the GetClonePath function
func FuzzGetClonePath(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		config := ChaosHubConfig{}
		if err := fuzzConsumer.GenerateStruct(&config); err != nil {
			return
		}

		result := GetClonePath(config)

		var expected string
		if config.IsDefault {
			expected = "/tmp/default/" + config.HubName
		} else {
			expected = DefaultPath + config.ProjectID + "/" + config.HubName
		}

		if result != expected {
			t.Errorf("Expected %s, got %s", expected, result)
		}
	})
}

// FuzzGitConfigConstruct is used to fuzz test the GitConfigConstruct function
func FuzzGitConfigConstruct(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		repoData := model.CloningInput{}
		if err := fuzzConsumer.GenerateStruct(&repoData); err != nil {
			return
		}
		projectID, _ := fuzzConsumer.GetString()

		config := GitConfigConstruct(repoData, projectID)

		if config.ProjectID != projectID {
			t.Errorf("Expected ProjectID %s, got %s", projectID, config.ProjectID)
		}
		if config.HubName != repoData.Name {
			t.Errorf("Expected HubName %s, got %s", repoData.Name, config.HubName)
		}
		if config.RepositoryURL != repoData.RepoURL {
			t.Errorf("Expected RepositoryURL %s, got %s", repoData.RepoURL, config.RepositoryURL)
		}
		if config.Branch != repoData.RepoBranch {
			t.Errorf("Expected Branch %s, got %s", repoData.RepoBranch, config.Branch)
		}
		if config.RemoteName != "origin" {
			t.Errorf("Expected RemoteName origin, got %s", config.RemoteName)
		}
		if config.IsPrivate != repoData.IsPrivate {
			t.Errorf("Expected IsPrivate %v, got %v", repoData.IsPrivate, config.IsPrivate)
		}
		if config.AuthType != repoData.AuthType {
			t.Errorf("Expected AuthType %s, got %s", repoData.AuthType, config.AuthType)
		}
		if config.IsDefault != repoData.IsDefault {
			t.Errorf("Expected IsDefault %v, got %v", repoData.IsDefault, config.IsDefault)
		}
	})
}

// FuzzGenerateAuthMethod is used to fuzz test the generateAuthMethod function
func FuzzGenerateAuthMethod(f *testing.F) {
	authTypes := []model.AuthType{
		model.AuthTypeBasic,
		model.AuthTypeNone,
		model.AuthTypeSSH,
		model.AuthTypeToken,
	}

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		config := ChaosHubConfig{}
		if err := fuzzConsumer.GenerateStruct(&config); err != nil {
			return
		}
		// Override AuthType with a valid enum since GenerateStruct rarely produces one.
		idx, _ := fuzzConsumer.GetInt()
		authType := authTypes[((idx%len(authTypes))+len(authTypes))%len(authTypes)]
		config.AuthType = authType

		auth, err := config.generateAuthMethod()

		switch authType {
		case model.AuthTypeToken, model.AuthTypeBasic:
			if err != nil {
				t.Errorf("Unexpected error for auth type %s: %v", authType, err)
			}
			if auth == nil {
				t.Errorf("Expected non-nil auth method for auth type %s", authType)
			}
		case model.AuthTypeSSH:
			// an arbitrary byte sequence is almost never a valid SSH key,
			// so when parsing succeeds the auth method must not be nil
			if err == nil && auth == nil {
				t.Errorf("Expected non-nil auth method for valid SSH key")
			}
		default:
			if auth != nil {
				t.Errorf("Expected nil auth method for auth type %s, got %v", authType, auth)
			}
		}
	})
}
