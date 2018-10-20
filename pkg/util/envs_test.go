/*
Copyright 2018 The OpenEBS Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package util

import (
	"os"
	"reflect"
	"testing"
)

func TestGetEnv(t *testing.T) {
	testCases := map[string]struct {
		Envkey      string
		value       string
		expectValue string
	}{
		"Missing env variable": {
			Envkey:      "",
			value:       "",
			expectValue: "",
		},
		"Present env variable with value": {
			Envkey:      "_MY_PRESENT_TEST_KEY_",
			value:       "value1",
			expectValue: "value1",
		},
		"Present env variable with empty value": {
			Envkey:      "_MY_PRESENT_TEST_KEY_W_EMPTY_VALUE",
			value:       "",
			expectValue: "",
		},
	}
	for k, v := range testCases {
		t.Run(k, func(t *testing.T) {
			os.Setenv(v.Envkey, v.value)
			actualValue := getEnv(ENVKey(v.Envkey))
			if !reflect.DeepEqual(actualValue, v.expectValue) {
				t.Errorf("expected %s got %s", v.expectValue, actualValue)
			}
			os.Unsetenv(v.Envkey)
		})
	}
}
