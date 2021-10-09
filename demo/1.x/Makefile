# Makefile for building Litmus Demo
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

.DEFAULT_GOAL              := help
VERSION ?= latest

ORG_NAME ?= litmuschaos
BASE_IMAGE_NAME ?= litmus-demo
CONTAINER_INSTANCE ?= default

# Add the following 'help' target to your Makefile
# And add help text after each target name starting with '\#\#'
.PHONY: help deps
help:						##Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## deps: Check if docker is installed or not
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

## build: Builds litmus-demo docker image
build: deps
	@echo "------------------"
	@echo "--> Building Litmus-Demo"
	@docker build -t  $(ORG_NAME)/$(BASE_IMAGE_NAME):$(VERSION) .
	@echo "------------------"

## exec: Login to container and execute litmus demo commands
exec:
	@echo "------------------"
	@echo "--> Login to Litmus Demo container"
	@docker run --rm  --name $(BASE_IMAGE_NAME)-$(CONTAINER_INSTANCE) \
		-v /var/run/docker.sock:/var/run/docker.sock --net="host" \
		-it --entrypoint bash $(ORG_NAME)/$(BASE_IMAGE_NAME)

## stop: stops docker container
stop:
	@docker stop $(BASE_IMAGE_NAME)-${CONTAINER_INSTANCE}
