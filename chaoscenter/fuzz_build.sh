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
export GO_MOD_PATHS_MAPPING=( "graphql/server" "authentication" "subscriber" )

cd chaoscenter
export rootDir=$(pwd)

for dir in "${GO_MOD_PATHS_MAPPING[@]}"; do
    cd ${dir} && go mod download
    go install github.com/AdamKorcz/go-118-fuzz-build@latest
    go get github.com/AdamKorcz/go-118-fuzz-build/testing
    fuzz_files=($(find "$(pwd)" -type f -name '*_fuzz_test.go'))
    for file in "${fuzz_files[@]}"; do
        pkg=$(grep -m 1 '^package' "$file" | awk '{print $2}')
        package_path=$(dirname "${file%$pkg}")
        functionList=($(grep -o 'func Fuzz[A-Za-z0-9_]*' ${file} | awk '{print $2}'))
        for i in "${functionList[@]}"
        do
            compile_native_go_fuzzer ${package_path} ${i} ${i}
        done
    done
    cd ${rootDir}
done