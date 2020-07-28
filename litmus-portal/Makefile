# Makefile for building Litmus Portal
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

#docker info
REPONAME ?= litmuschaos
GRAPHQL_SERVER_IMAGE ?= litmusportal-server
AUTHENTICATION_SERVER_IMAGE ?= litmusportal-auth-server
FRONTEND_IMAGE ?= litmusportal-frontend
SUBSCRIBER_IMAGE ?= litmusportal-subscriber
SELF_DEPLOYER_IMAGE ?= litmusportal-self-deployer
IMGTAG ?= ci

.PHONY: all
all: deps litmus-portal-check litmus-portal-test build push

.PHONY: help
help:
	@echo ""
	@echo "Usage:-"
	@echo "\tmake all   -- [default] builds the litmus containers"
	@echo ""

.PHONY: deps
deps: _build_check_docker

_build_check_docker:
	@echo "------------------"
	@echo "--> Check the Docker deps" 
	@echo "------------------"
	@if [ $(IS_DOCKER_INSTALLED) -eq 1 ]; \
		then echo "" \
		&& echo "ERROR:\tdocker is not installed. Please install it before build." \
		&& echo "" \
		&& exit 1; \
		fi;

.PHONY: build
build: litmus-portal-build

litmus-portal-build:
	@echo "------------------"
	@echo "--> Build frontend and backend images" 
	@echo "------------------"
	docker build ./frontend -f frontend/Dockerfile -t $(REPONAME)/$(FRONTEND_IMAGE):$(IMGTAG)
	docker build ./backend/graphql-server -f backend/graphql-server/build/Dockerfile -t $(REPONAME)/$(GRAPHQL_SERVER_IMAGE):$(IMGTAG)
	docker build ./backend/auth -f backend/auth/Dockerfile -t $(REPONAME)/$(AUTHENTICATION_SERVER_IMAGE):$(IMGTAG)
	docker build ./backend/subscriber -f backend/subscriber/build/Dockerfile -t $(REPONAME)/$(SUBSCRIBER_IMAGE):$(IMGTAG)
	docker build ./backend/self-deployer -f backend/self-deployer/build/Dockerfile -t $(REPONAME)/$(SELF_DEPLOYER_IMAGE):$(IMGTAG)

.PHONY: push
push: litmus-portal-push

litmus-portal-push:
	@echo "------------------"
	@echo "--> Push frontend and backend images" 
	@echo "------------------"
	REPONAME=$(REPONAME) IMGNAME=$(FRONTEND_IMAGE) IMGTAG=$(IMGTAG) ../hack/push
	REPONAME=$(REPONAME) IMGNAME=$(GRAPHQL_SERVER_IMAGE) IMGTAG=$(IMGTAG) ../hack/push
	REPONAME=$(REPONAME) IMGNAME=$(SUBSCRIBER_IMAGE) IMGTAG=$(IMGTAG) ../hack/push
	REPONAME=$(REPONAME) IMGNAME=$(AUTHENTICATION_SERVER_IMAGE) IMGTAG=$(IMGTAG) ../hack/push
	REPONAME=$(REPONAME) IMGNAME=$(SELF_DEPLOYER_IMAGE) IMGTAG=$(IMGTAG) ../hack/push


.PHONY: litmus-portal-check
litmus-portal-check : lint-checks unused-package-check

lint-checks:
	@echo "------------------"
	@echo "--> checking code style"
	@echo "------------------"
	@fmtRes=$$(gofmt -d $$(find . -path ./vendor -prune -o -name '*.go' -print)); \
	if [ -n "$${fmtRes}" ]; then \
		echo "gofmt checking failed!"; echo "$${fmtRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
	fi

unused-package-check:
	@echo "------------------"
	@echo "--> Check litmus-portal backend [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd backend/graphql-server && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!"; echo "$${tidyRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal auth [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd backend/auth && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!"; echo "$${tidyRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
	fi
	
.PHONY: litmus-portal-test
litmus-portal-test : frontend-unit-test

frontend-unit-test:
	@echo "------------------"
	@echo "--> Frontend Unit Test"
	@echo "------------------"
	cd ./frontend && npm i && npx cypress run
