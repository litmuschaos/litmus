package chaos_infrastructure_test

import (
	"bytes"
	"io"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gopkg.in/yaml.v2"
)

func TestManifestParser_CustomTLSCert(t *testing.T) {
	testCertValue := "dGVzdC1jdXN0b20tdGxzLWNlcnQtZml4dHVyZQ=="

	testCases := []struct {
		name     string
		rootPath string
		scope    string
	}{
		{
			name:     "cluster scope manifest",
			rootPath: "../../manifests/cluster",
			scope:    "cluster",
		},
		{
			name:     "namespace scope manifest",
			rootPath: "../../manifests/namespace",
			scope:    "namespace",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			infra := dbChaosInfra.ChaosInfra{
				InfraID:    "test-infra-id",
				AccessKey:  "test-access-key",
				InfraScope: tc.scope,
			}
			config := &chaos_infrastructure.SubscriberConfigurations{
				ServerEndpoint: "https://chaoscenter.litmus.io/query",
				TLSCert:        testCertValue,
			}

			manifestBytes, err := chaos_infrastructure.ManifestParser(infra, tc.rootPath, config)
			require.NoError(t, err, "ManifestParser should succeed for %s", tc.name)
			require.NotEmpty(t, manifestBytes)

			var (
				foundConfigMap bool
				foundSecret    bool
			)

			decoder := yaml.NewDecoder(bytes.NewReader(manifestBytes))
			for {
				var doc map[string]interface{}
				decodeErr := decoder.Decode(&doc)
				if decodeErr == io.EOF {
					break
				}
				require.NoError(t, decodeErr, "Failed to decode YAML document")

				kind, _ := doc["kind"].(string)
				metadata, _ := doc["metadata"].(map[interface{}]interface{})
				name, _ := metadata["name"].(string)

				if kind == "ConfigMap" && name == "subscriber-config" {
					foundConfigMap = true
					data, ok := doc["data"].(map[interface{}]interface{})
					require.True(t, ok, "subscriber-config must have data block")

					// CUSTOM_TLS_CERT must NOT be present in subscriber-config ConfigMap
					_, hasCert := data["CUSTOM_TLS_CERT"]
					assert.False(t, hasCert, "CUSTOM_TLS_CERT must not be present in subscriber-config ConfigMap data")
				}

				if kind == "Secret" && name == "subscriber-secret" {
					foundSecret = true
					stringData, ok := doc["stringData"].(map[interface{}]interface{})
					require.True(t, ok, "subscriber-secret must have stringData block")

					// CUSTOM_TLS_CERT must be present in subscriber-secret with substituted fixture value
					certVal, hasCert := stringData["CUSTOM_TLS_CERT"]
					assert.True(t, hasCert, "CUSTOM_TLS_CERT must be present in subscriber-secret stringData")
					assert.Equal(t, testCertValue, certVal, "CUSTOM_TLS_CERT value must match substituted test cert fixture")
				}
			}

			assert.True(t, foundConfigMap, "subscriber-config ConfigMap was not found in parsed manifests")
			assert.True(t, foundSecret, "subscriber-secret Secret was not found in parsed manifests")
		})
	}
}
