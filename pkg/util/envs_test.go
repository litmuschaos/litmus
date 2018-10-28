
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
	"strings"
	"testing"
)

func TestgetEnv(t *Testing.T){

	testCases := []string{
		"abc",
		"ab bc",
		"",
	}

	for _, v := range testCases {
		err := os.Setenv("LITMUS_IO_KUBE_NAMESPACE", v) 
		if err != nil {
			t.Fatal("Unable to set environment variable")
		}

		if(strings(os.Getenv(string("LITMUS_IO_KUBE_NAMESPACE"))) != v){
			t.Errorf("Expected was %s, got %s", v, strings(os.Getenv(string("LITMUS_IO_KUBE_NAMESPACE"))))
		}
	}
	

	
}