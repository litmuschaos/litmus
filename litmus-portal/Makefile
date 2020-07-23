# Docker repositories
REPONAME ?= litmuschaos
GRAPHQL_SERVER_IMAGE ?= litmusportal-server
AUTHENTICATION_SERVER_IMAGE ?= litmusportal-auth-server
FRONTEND_IMAGE ?= litmusportal-frontend
IGC_IMAGE ?= litmusportal-igc
IMGTAG ?= ci

.PHONY: all
all: litmus-portal-check  docker-build test docker-push


.PHONY: litmus-portal-check
litmus-portal-check : lint-checks unused-package-check

lint-checks:
	@echo "------------------"
	@echo "--> checking code style"
	@echo "------------------"
	@echo "--> frontend [npm run lint]"
	@echo "------------------"
	@cd frontend && npm i --quiet && npm run lint
	@echo "------------------"
	@echo "--> backend [gofmt ]"
	@echo "------------------"
	@fmtRes=$$(gofmt -d $$(find . -path ./vendor -prune -o -name '*.go' -print)); \
	if [ -n "$${fmtRes}" ]; then \
		echo "gofmt checking failed!"; echo "$${fmtRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
		exit 1; \
	fi


unused-package-check:
	@echo "------------------"
	@echo "--> Check litmus-portal backend [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd backend/graphql-server && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!"; echo "$${tidyRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
		exit 1; \
	fi
	@echo "------------------"
	@echo "--> Check litmus-portal auth [go mod tidy]"
	@echo "------------------"
	@tidyRes=$$(cd backend/auth && go mod tidy); \
	if [ -n "$${tidyRes}" ]; then \
		echo "go mod tidy checking failed!"; echo "$${tidyRes}"; echo; \
		echo "Please ensure you are using $$($(GO) version) for formatting code."; \
		exit 1; \
	fi

.PHONY: docker-build
docker-build:
	@echo "------------------"
	@echo "--> Build frontend and backend images"
	@echo "------------------"
	docker build ./frontend -f frontend/Dockerfile -t $(REPONAME)/$(FRONTEND_IMAGE):$(IMGTAG)
	docker build ./backend/graphql-server -f backend/graphql-server/build/Dockerfile -t $(REPONAME)/$(GRAPHQL_SERVER_IMAGE):$(IMGTAG)
	docker build ./backend/auth -f backend/auth/Dockerfile -t $(REPONAME)/$(AUTHENTICATION_SERVER_IMAGE):$(IMGTAG)
	docker build ./backend/subscriber/igc -f backend/subscriber/igc/build/Dockerfile -t $(REPONAME)/$(IGC_IMAGE):$(IMGTAG)

.PHONY: docker-push
docker-push:
	@echo "------------------"
	@echo "--> Push frontend and backend images"
	@echo "------------------"
	REPONAME=$(REPONAME) IMGNAME=$(FRONTEND_IMAGE) IMGTAG=$(IMGTAG) ~/go/src/github.com/litmuschaos/litmus/hack/push
	REPONAME=$(REPONAME) IMGNAME=$(GRAPHQL_SERVER_IMAGE) IMGTAG=$(IMGTAG) ~/go/src/github.com/litmuschaos/litmus/hack/push
	REPONAME=$(REPONAME) IMGNAME=$(IGC_IMAGE) IMGTAG=$(IMGTAG) ~/go/src/github.com/litmuschaos/litmus/hack/push
	REPONAME=$(REPONAME) IMGNAME=$(AUTHENTICATION_SERVER_IMAGE) IMGTAG=$(IMGTAG) ~/go/src/github.com/litmuschaos/litmus/hack/push

.PHONY: test
test : frontend-unit-test

frontend-unit-test:
	@echo "------------------"
	@echo "--> Frontend Unit Test"
	@echo "------------------"
	cd ./frontend && npm i --quite && npx cypress run
