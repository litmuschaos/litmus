# Makefile for building Litmus Portal
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

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

.PHONY: litmus-portal-check
litmus-portal-check : frontend-services-checks backend-services-checks

frontend-services-checks:
	@echo "------------------"
	@echo "--> checking code style [frontend]"
	@echo "------------------"
	cd frontend && npm i eslint --no-save && npm run lint
	@echo "------------------"
	@echo "--> Check litmus-portal frontend [depcheck]"
	@echo "------------------"
	cd frontend && npm i depcheck --no-save && node_modules/.bin/depcheck --skip-missing .

backend-services-checks:
	@echo "------------------"
	@echo "--> checking code style [backend]"
	@echo "------------------"
	@fmtRes=$$(gofmt -d $$(find . -path ./vendor -prune -o -name '*.go' -print)); \
	if [ -n "$${fmtRes}" ]; then \
		echo "gofmt checking failed!" && echo "$${fmtRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code." \
		&& exit 1;\
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal backend [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd graphql-server && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code." \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal authentication [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd authentication && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code." \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal workflow-agent [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd cluster-agents/workflow-agent && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code" \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal subscriber [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd cluster-agents/subscriber && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code" \
		&& exit 1; \
	fi
