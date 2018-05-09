# Makefile for building Litmus and its tools
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list only our namespaced directories
PACKAGES = $(shell go list ./... | grep -v '/vendor/')

.PHONY: all
all: format metalint compile

.PHONY: help
help:
	@echo ""
	@echo "Usage:-"
	@echo "\tmake deps  -- will verify build dependencies are installed"
	@echo "\tmake all   -- [default] builds the litmus containers"
	@echo ""

# `make deps` needs to be run in a completely new environment
# In case of go related issues, run below commands & verify:
# go version    # ensure go1.9.1 or above
# go env        # ensure if GOPATH is set
# echo $PATH    # ensure if $GOPATH/bin is set
.PHONY: godeps
godeps:
	@echo ""
	@echo "INFO:\tverifying dependencies for Litmus ..."
	@go get -u -v github.com/golang/lint/golint
	@go get -u -v golang.org/x/tools/cmd/goimports
	@go get -u -v github.com/golang/dep/cmd/dep
	@go get -u -v github.com/DATA-DOG/godog/cmd/godog
	@go get -u -v github.com/alecthomas/gometalinter
	@gometalinter --install

_build_check_docker:
	@if [ $(IS_DOCKER_INSTALLED) -eq 1 ]; \
		then echo "" \
		&& echo "ERROR:\tdocker is not installed. Please install it before build." \
		&& echo "" \
		&& exit 1; \
		fi;

.PHONY: deps
deps: _build_check_docker godeps

.PHONY: format
format:
	@echo "------------------"
	@echo "--> Running go fmt"
	@echo "------------------"
	@go fmt $(PACKAGES)

.PHONY: lint
lint:
	@echo "------------------"
	@echo "--> Running golint"
	@echo "------------------"
	@golint $(PACKAGES)
	@echo "------------------"
	@echo "--> Running go vet"
	@echo "------------------"
	@go vet $(PACKAGES)

.PHONY: metalint
metalint:
	@echo "------------------"
	@echo "--> Running metalinter"
	@echo "------------------"
	@gometalinter $(PACKAGES)

.PHONY: compile
compile:
	@echo "------------------"
	@echo "--> Check compilation"
	@echo "------------------"
	@go test $(PACKAGES)

.PHONY: all-tools
all-tools: godog-runner-image ansible-runner-image

.PHONY: godog-runner-image
godog-runner-image:
	@echo "------------------"
	@echo "--> Build godog-runner image" 
	@echo "------------------"
	sudo docker build . -f tools/godog-runner/Dockerfile -t openebs/godog-runner:ci
	REPONAME="openebs" IMGNAME="godog-runner" IMGTAG="ci" ./hack/push

.PHONY: ansible-runner-image
ansible-runner-image:
	@echo "------------------"
	@echo "--> Build ansible-runner image" 
	@echo "------------------"
	sudo docker build . -f tools/ansible-runner/Dockerfile -t openebs/ansible-runner:ci
	REPONAME="openebs" IMGNAME="ansible-runner" IMGTAG="ci" ./hack/push
