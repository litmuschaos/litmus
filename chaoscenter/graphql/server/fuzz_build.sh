cd chaoscenter/graphql/server && go mod download
go install github.com/AdamKorcz/go-118-fuzz-build@latest
go get github.com/AdamKorcz/go-118-fuzz-build/testing

compile_native_go_fuzzer $(pwd)/pkg/environment/handler FuzzTestGetEnvironment test-fuzz