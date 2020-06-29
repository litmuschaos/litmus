# Makefile for building Litmus Portal
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)


.PHONY: all
all: deps litmus-portal-check build push

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
	docker build ./frontend -f frontend/Dockerfile -t litmuschaos/litmusportal-frontend:ci
	docker build ./backend/graphql-server -f backend/graphql-server/build/Dockerfile -t litmuschaos/litmusportal-server:ci
	docker build ./backend/subscriber/igc -f backend/subscriber/igc/build/Dockerfile -t litmuschaos/litmusportal-igc:ci

.PHONY: push
push: litmus-portal-push

litmus-portal-push:
	@echo "------------------"
	@echo "--> Push frontend and backend images" 
	@echo "------------------"
	REPONAME="litmuschaos" IMGNAME="litmusportal-frontend" IMGTAG="ci" ../hack/push
	REPONAME="litmuschaos" IMGNAME="litmusportal-server" IMGTAG="ci" ../hack/push
	REPONAME="litmuschaos" IMGNAME="litmusportal-igc" IMGTAG="ci" ../hack/push


.PHONY: litmus-portal-check
 litmus-portal-check : lint-checks unused-package-check

lint-checks:
	@echo "------------------"
	@echo "--> Check litmus-portal frontend lint"
	@echo "------------------"
	cd frontend && npm run lint
	@echo "------------------"
	@echo "--> Check litmus-portal backend [gofmt]"
	@echo "------------------"
	@fmtRes=$$(gofmt -d backend/graphql-server/*); \
	if [ -n "$${fmtRes}" ]; then \
		echo "gofmt checking failed!"; echo "$${fmtRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
		exit 0; \
	fi

unused-package-check:
	@echo "------------------"
	@echo "--> Check litmus-portal backend [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd backend/graphql-server && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!"; echo "$${tidyRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
		exit 0; \
	fi