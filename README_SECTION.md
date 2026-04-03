# Makefile Usage

## Building and Testing

LitmusChaos provides a Makefile for streamlined development workflow.

### Quick Start

```bash
# View all available commands
make help

# Build all services
make build

# Run all tests
make test

# Format and verify code
make verify

# Run pre-commit checks
make pre-commit
```

### Common Commands

| Command | Description |
|---------|-------------|
| `make build` | Build all Go services |
| `make test` | Run all tests |
| `make unit-test` | Run only unit tests |
| `make integration-test` | Run integration tests |
| `make lint` | Run golangci-lint checks |
| `make fmt` | Format Go code |
| `make vet` | Run go vet |
| `make clean` | Remove build artifacts |
| `make ci` | Run full CI pipeline |
| `make pre-commit` | Run pre-commit checks (fmt, vet, test) |

### Prerequisites

- Go 1.24.0 or higher
- Node.js and Yarn (for frontend)
- golangci-lint (optional, for linting)

### Installing golangci-lint

```bash
# macOS/Linux
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

# Or using go install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

### Before Committing

```bash
# Run pre-commit checks
make pre-commit
```

### Before Pushing

```bash
# Run full CI pipeline locally
make ci
```

This ensures your changes pass all checks before pushing to remote.
