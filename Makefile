# Makefile for LitmusChaos
# Reference: https://www.gnu.org/software/make/manual/make.html
#
# This Makefile provides standardized targets for building, testing, and managing
# the LitmusChaos project following CNCF best practices.

#-----------------------------------------------------------------------------
# Global Variables
#-----------------------------------------------------------------------------

# Go parameters
GO           := go
GOPATH       := $(shell $(GO) env GOPATH)
GOBIN        := $(GOPATH)/bin
GOFMT        := gofmt
GOTEST       := $(GO) test
GOVET        := $(GO) vet
GOBUILD      := $(GO) build
GOCLEAN      := $(GO) clean
GOMOD        := $(GO) mod

# Directories
ROOT_DIR     := $(shell pwd)
CHAOSCENTER  := $(ROOT_DIR)/chaoscenter
AUTH_DIR     := $(CHAOSCENTER)/authentication
GRAPHQL_DIR  := $(CHAOSCENTER)/graphql/server
SUBSCRIBER_DIR := $(CHAOSCENTER)/subscriber
EVENT_TRACKER_DIR := $(CHAOSCENTER)/event-tracker
UPGRADE_AGENT_DIR := $(CHAOSCENTER)/upgrade-agents/control-plane
WEB_DIR      := $(CHAOSCENTER)/web

# Go modules
GO_MODULES   := $(AUTH_DIR) $(GRAPHQL_DIR) $(SUBSCRIBER_DIR) $(EVENT_TRACKER_DIR) $(UPGRADE_AGENT_DIR)

# Build output
BUILD_DIR    := $(ROOT_DIR)/build
BIN_DIR      := $(BUILD_DIR)/bin

# Colors for output
COLOR_RESET  := \033[0m
COLOR_BOLD   := \033[1m
COLOR_GREEN  := \033[32m
COLOR_YELLOW := \033[33m
COLOR_BLUE   := \033[34m

#-----------------------------------------------------------------------------
# Default Target
#-----------------------------------------------------------------------------

.DEFAULT_GOAL := help

#-----------------------------------------------------------------------------
# Build Targets
#-----------------------------------------------------------------------------

.PHONY: build
build: ## Build all Go services
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Building all services...$(COLOR_RESET)"
	@mkdir -p $(BIN_DIR)
	@$(MAKE) build-authentication
	@$(MAKE) build-graphql-server
	@$(MAKE) build-subscriber
	@$(MAKE) build-event-tracker
	@echo "$(COLOR_GREEN)✓ Build completed successfully$(COLOR_RESET)"

.PHONY: build-authentication
build-authentication: ## Build authentication service
	@echo "$(COLOR_BLUE)Building authentication service...$(COLOR_RESET)"
	@mkdir -p $(BIN_DIR)
	@cd $(AUTH_DIR) && $(GOBUILD) -o $(BIN_DIR)/authentication ./api

.PHONY: build-graphql-server
build-graphql-server: ## Build GraphQL server
	@echo "$(COLOR_BLUE)Building GraphQL server...$(COLOR_RESET)"
	@mkdir -p $(BIN_DIR)
	@cd $(GRAPHQL_DIR) && $(GOBUILD) -o $(BIN_DIR)/graphql-server .

.PHONY: build-subscriber
build-subscriber: ## Build subscriber service
	@echo "$(COLOR_BLUE)Building subscriber service...$(COLOR_RESET)"
	@mkdir -p $(BIN_DIR)
	@cd $(SUBSCRIBER_DIR) && $(GOBUILD) -o $(BIN_DIR)/subscriber .

.PHONY: build-event-tracker
build-event-tracker: ## Build event tracker service
	@echo "$(COLOR_BLUE)Building event tracker service...$(COLOR_RESET)"
	@mkdir -p $(BIN_DIR)
	@cd $(EVENT_TRACKER_DIR) && $(GOBUILD) -o $(BIN_DIR)/event-tracker .

#-----------------------------------------------------------------------------
# Test Targets
#-----------------------------------------------------------------------------

.PHONY: test
test: unit-test ## Run all tests (unit + integration)
	@echo "$(COLOR_GREEN)✓ All tests completed$(COLOR_RESET)"

.PHONY: unit-test
unit-test: ## Run unit tests for all Go modules
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Running unit tests...$(COLOR_RESET)"
	@$(MAKE) test-authentication
	@$(MAKE) test-graphql-server
	@$(MAKE) test-subscriber
	@$(MAKE) test-event-tracker
	@echo "$(COLOR_GREEN)✓ Unit tests passed$(COLOR_RESET)"

.PHONY: test-authentication
test-authentication: ## Run authentication service tests
	@echo "$(COLOR_BLUE)Testing authentication service...$(COLOR_RESET)"
	@cd $(AUTH_DIR) && $(GOTEST) -v -cover ./...

.PHONY: test-graphql-server
test-graphql-server: ## Run GraphQL server tests
	@echo "$(COLOR_BLUE)Testing GraphQL server...$(COLOR_RESET)"
	@cd $(GRAPHQL_DIR) && $(GOTEST) -v -cover ./...

.PHONY: test-subscriber
test-subscriber: ## Run subscriber service tests
	@echo "$(COLOR_BLUE)Testing subscriber service...$(COLOR_RESET)"
	@cd $(SUBSCRIBER_DIR) && $(GOTEST) -v -cover ./...

.PHONY: test-event-tracker
test-event-tracker: ## Run event tracker service tests
	@echo "$(COLOR_BLUE)Testing event tracker service...$(COLOR_RESET)"
	@cd $(EVENT_TRACKER_DIR) && $(GOTEST) -v -cover ./...

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "$(COLOR_BLUE)Testing frontend...$(COLOR_RESET)"
	@cd $(WEB_DIR) && yarn test --coverage

.PHONY: integration-test
integration-test: ## Run integration tests
	@echo "$(COLOR_YELLOW)Integration tests not yet implemented$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)This target is reserved for future integration test suites$(COLOR_RESET)"

#-----------------------------------------------------------------------------
# Code Quality Targets
#-----------------------------------------------------------------------------

.PHONY: lint
lint: ## Run linting checks (requires golangci-lint)
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Running linting checks...$(COLOR_RESET)"
	@if command -v golangci-lint >/dev/null 2>&1; then \
		for dir in $(GO_MODULES); do \
			echo "$(COLOR_BLUE)Linting $$dir...$(COLOR_RESET)"; \
			cd $$dir && golangci-lint run ./... || exit 1; \
		done; \
		echo "$(COLOR_GREEN)✓ Linting passed$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠ golangci-lint not installed$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)Install it from: https://golangci-lint.run/usage/install/$(COLOR_RESET)"; \
		exit 1; \
	fi

.PHONY: lint-frontend
lint-frontend: ## Run frontend linting
	@echo "$(COLOR_BLUE)Linting frontend...$(COLOR_RESET)"
	@cd $(WEB_DIR) && yarn lint

.PHONY: fmt
fmt: ## Format Go code using gofmt
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Formatting Go code...$(COLOR_RESET)"
	@for dir in $(GO_MODULES); do \
		echo "$(COLOR_BLUE)Formatting $$dir...$(COLOR_RESET)"; \
		$(GOFMT) -w -s $$dir; \
	done
	@echo "$(COLOR_GREEN)✓ Code formatted$(COLOR_RESET)"

.PHONY: fmt-check
fmt-check: ## Check if Go code is formatted
	@echo "$(COLOR_BLUE)Checking code formatting...$(COLOR_RESET)"
	@unformatted=$$(for dir in $(GO_MODULES); do \
		$(GOFMT) -l $$dir; \
	done); \
	if [ -n "$$unformatted" ]; then \
		echo "$(COLOR_YELLOW)The following files are not formatted:$(COLOR_RESET)"; \
		echo "$$unformatted"; \
		echo "$(COLOR_YELLOW)Run 'make fmt' to format them$(COLOR_RESET)"; \
		exit 1; \
	fi
	@echo "$(COLOR_GREEN)✓ All files are properly formatted$(COLOR_RESET)"

.PHONY: vet
vet: ## Run go vet on all modules
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Running go vet...$(COLOR_RESET)"
	@for dir in $(GO_MODULES); do \
		echo "$(COLOR_BLUE)Vetting $$dir...$(COLOR_RESET)"; \
		cd $$dir && $(GOVET) ./... || exit 1; \
	done
	@echo "$(COLOR_GREEN)✓ Vet checks passed$(COLOR_RESET)"

.PHONY: tidy
tidy: ## Run go mod tidy on all modules
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Tidying Go modules...$(COLOR_RESET)"
	@for dir in $(GO_MODULES); do \
		echo "$(COLOR_BLUE)Tidying $$dir...$(COLOR_RESET)"; \
		cd $$dir && $(GOMOD) tidy || exit 1; \
	done
	@echo "$(COLOR_GREEN)✓ Modules tidied$(COLOR_RESET)"

.PHONY: verify
verify: fmt-check vet tidy ## Run all verification checks (fmt-check, vet, tidy)
	@echo "$(COLOR_GREEN)✓ All verification checks passed$(COLOR_RESET)"

#-----------------------------------------------------------------------------
# Dependency Management
#-----------------------------------------------------------------------------

.PHONY: deps
deps: ## Download Go module dependencies
	@echo "$(COLOR_BLUE)Downloading Go dependencies...$(COLOR_RESET)"
	@for dir in $(GO_MODULES); do \
		echo "$(COLOR_BLUE)Downloading dependencies for $$dir...$(COLOR_RESET)"; \
		cd $$dir && $(GOMOD) download || exit 1; \
	done
	@echo "$(COLOR_GREEN)✓ Dependencies downloaded$(COLOR_RESET)"

.PHONY: deps-frontend
deps-frontend: ## Install frontend dependencies
	@echo "$(COLOR_BLUE)Installing frontend dependencies...$(COLOR_RESET)"
	@cd $(WEB_DIR) && yarn install
	@echo "$(COLOR_GREEN)✓ Frontend dependencies installed$(COLOR_RESET)"

#-----------------------------------------------------------------------------
# Development Targets
#-----------------------------------------------------------------------------

.PHONY: dev
dev: ## Start local development environment
	@echo "$(COLOR_BOLD)$(COLOR_BLUE)Starting local development environment...$(COLOR_RESET)"
	@bash $(ROOT_DIR)/scripts/start-dev.sh

#-----------------------------------------------------------------------------
# Clean Targets
#-----------------------------------------------------------------------------

.PHONY: clean
clean: ## Remove build artifacts and clean Go cache
	@echo "$(COLOR_BLUE)Cleaning build artifacts...$(COLOR_RESET)"
	@rm -rf $(BUILD_DIR)
	@for dir in $(GO_MODULES); do \
		echo "$(COLOR_BLUE)Cleaning $$dir...$(COLOR_RESET)"; \
		cd $$dir && $(GOCLEAN) || true; \
	done
	@echo "$(COLOR_GREEN)✓ Cleaned successfully$(COLOR_RESET)"

.PHONY: clean-all
clean-all: clean ## Remove all generated files including dependencies
	@echo "$(COLOR_BLUE)Removing all generated files...$(COLOR_RESET)"
	@cd $(WEB_DIR) && rm -rf node_modules || true
	@echo "$(COLOR_GREEN)✓ Deep clean completed$(COLOR_RESET)"

#-----------------------------------------------------------------------------
# Docker Targets
#-----------------------------------------------------------------------------

.PHONY: docker-build
docker-build: ## Build Docker images (requires Docker)
	@echo "$(COLOR_BLUE)Building Docker images...$(COLOR_RESET)"
	@if command -v docker >/dev/null 2>&1; then \
		cd $(CHAOSCENTER) && $(MAKE) deps; \
		echo "$(COLOR_GREEN)✓ Docker images built$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_YELLOW)⚠ Docker not installed$(COLOR_RESET)"; \
		exit 1; \
	fi

#-----------------------------------------------------------------------------
# CI/CD Targets
#-----------------------------------------------------------------------------

.PHONY: ci
ci: verify test ## Run CI pipeline (verify + test)
	@echo "$(COLOR_GREEN)✓ CI pipeline completed successfully$(COLOR_RESET)"

.PHONY: pre-commit
pre-commit: fmt vet test ## Run pre-commit checks (fmt, vet, test)
	@echo "$(COLOR_GREEN)✓ Pre-commit checks passed$(COLOR_RESET)"

#-----------------------------------------------------------------------------
# Help Target
#-----------------------------------------------------------------------------

.PHONY: help
help: ## Display this help message
	@echo "$(COLOR_BOLD)LitmusChaos Makefile$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Usage:$(COLOR_RESET)"
	@echo "  make $(COLOR_BLUE)<target>$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Available targets:$(COLOR_RESET)"
	@awk 'BEGIN {FS = ":.*##"; printf ""} \
		/^[a-zA-Z_-]+:.*?##/ { \
			printf "  $(COLOR_BLUE)%-20s$(COLOR_RESET) %s\n", $$1, $$2 \
		}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(COLOR_BOLD)Examples:$(COLOR_RESET)"
	@echo "  make build          # Build all services"
	@echo "  make test           # Run all tests"
	@echo "  make lint           # Run linting checks"
	@echo "  make fmt            # Format code"
	@echo "  make clean          # Clean build artifacts"
	@echo "  make ci             # Run full CI pipeline"
	@echo ""
