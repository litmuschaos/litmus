#!/bin/bash -eu
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
################################################################################
# cd chaoscenter/graphql/server && go mod download
# go install github.com/AdamKorcz/go-118-fuzz-build@latest
# go get github.com/AdamKorcz/go-118-fuzz-build/testing

# compile_native_go_fuzzer $(pwd)/pkg/environment/handler FuzzTestGetEnvironment test-fuzz


# grep --line-buffered --include '*_test_fuzz.go' -Pr 'func Fuzz.*\(.* \*testing\.F' | sed -E 's/(func Fuzz(.*)\(.*)/\2/' | xargs -I{} sh -c '
#   file="$(echo "{}" | cut -d: -f1)"
#   folder="$(dirname $file)"
#   func="Fuzz$(echo "{}" | cut -d: -f2)"
#   compile_native_go_fuzzer github.com/crossplane/crossplane/$folder $func $func
# '


export GO_MOD_PATHS_MAPPING=( "graphql/server")

for dir in "${GO_MOD_PATHS_MAPPING[@]}"; do
   (cd ${dir} && go mod download &&
   go install github.com/AdamKorcz/go-118-fuzz-build@latest &&
   go get github.com/AdamKorcz/go-118-fuzz-build/testing &&
   ./test-fuzz.sh $(pwd)/pkg/environment/test FuzzTestGetEnvironment test-fuzz)
done