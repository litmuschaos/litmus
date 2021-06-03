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
	@echo "--> Check litmusportal frontend [depcheck]"
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
	@echo "--> Check litmusportal backend [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd graphql-server && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code." \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmusportal authentication [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd authentication && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code." \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmusportal subscriber [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd cluster-agents/subscriber && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code" \
		&& exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmusportal event tracker [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd cluster-agents/event-tracker && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!" && echo "$${tidyRes}" \
		&& echo "Please ensure you are using $$($(GO) version) for formatting code" \
		&& exit 1; \
	fi

.PHONY: docker.buildx
docker.buildx:
	@echo "------------------------------"
	@echo "--> Setting up Builder        " 
	@echo "------------------------------"
	@if ! docker buildx ls | grep -q multibuilder; then\
		docker buildx create --name multibuilder;\
		docker buildx inspect multibuilder --bootstrap;\
		docker buildx use multibuilder;\
		docker run --rm --privileged multiarch/qemu-user-static --reset -p yes;\
	fi

.PHONY: push-portal-component
push-portal-component: docker.buildx buildx.push.image

.PHONY: push-frontend
push-frontend: docker.buildx buildx.push.frontend

buildx.push.image:
	@cd $(DIRECTORY) && \
	docker buildx build -f Dockerfile --progress plane --push --no-cache --platform $(PLATFORMS) -t $(REPONAME)/$(IMAGE_NAME):$(IMG_TAG) .

buildx.push.frontend:
	@cd frontend && \
	if [ "${IMG_TAG}" = "ci" ]; then \
        docker build . -f Dockerfile -t $(REPONAME)/$(FRONTEND_IMAGE):$(IMG_TAG) --build-arg REACT_APP_KB_CHAOS_VERSION=$(IMG_TAG) --build-arg REACT_APP_BUILD_TIME="$(timestamp)" --build-arg REACT_APP_HUB_BRANCH_NAME="v1.13.x" --build-arg TARGETARCH=amd64;\
        docker push $(REPONAME)/$(FRONTEND_IMAGE):$(IMG_TAG);\
	else \
	    docker buildx build . -f Dockerfile --progress plane --push --no-cache --platform $(PLATFORMS) -t $(REPONAME)/$(FRONTEND_IMAGE):$(IMG_TAG) --build-arg REACT_APP_KB_CHAOS_VERSION=$(IMG_TAG) \
		--build-arg REACT_APP_BUILD_TIME="$(timestamp)" --build-arg REACT_APP_HUB_BRANCH_NAME="v1.13.x";\
    fi

.PHONY: push-portal-component-amd64
push-portal-component-amd64: docker-build-portal-amd64 docker-push-portal-amd64

docker-build-portal-amd64:
	@cd $(DIRECTORY) && \
    docker build . -f Dockerfile -t $(REPONAME)/$(IMAGE_NAME):$(IMG_TAG) --build-arg TARGETARCH=amd64
docker-push-portal-amd64:
	@docker push $(REPONAME)/$(IMAGE_NAME):$(IMG_TAG)

.PHONY: push-frontend-amd64
push-frontend-amd64: docker-build-frontend-amd64 docker-push-frontend-amd64

docker-build-frontend-amd64:
	@cd frontend && \
    docker build . -f Dockerfile -t $(REPONAME)/$(IMAGE_NAME):$(IMG_TAG) --build-arg TARGETARCH=amd64 --build-arg REACT_APP_KB_CHAOS_VERSION=$(IMG_TAG) \
		--build-arg REACT_APP_BUILD_TIME="$(timestamp)" --build-arg REACT_APP_HUB_BRANCH_NAME="v1.13.x
docker-push-frontend-amd64:
	@docker push $(REPONAME)/$(IMAGE_NAME):$(IMG_TAG)