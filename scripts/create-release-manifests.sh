#!/bin/bash

# Script to create release manifests for a new version
# Usage: ./create-release-manifests.sh <version>
# Example: ./create-release-manifests.sh 3.25.0

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if version argument is provided
if [ -z "$1" ]; then
    print_error "Release version not provided!"
    echo "Usage: $0 <version>"
    echo "Example: $0 3.25.0"
    exit 1
fi

VERSION="$1"

# Extract branch version (e.g., 3.25.x from 3.25.0)
# This handles versions like 3.25.0, 3.25.1, etc. and converts to 3.25.x
BRANCH_VERSION=$(echo "$VERSION" | sed -E 's/^([0-9]+\.[0-9]+)\.[0-9]+$/\1.x/')

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Define paths
MKDOCS_DIR="$PROJECT_ROOT/mkdocs/docs"
MANIFESTS_SOURCE="$PROJECT_ROOT/chaoscenter/manifests"
TARGET_DIR="$MKDOCS_DIR/$VERSION"

# Validate source directory exists
if [ ! -d "$MANIFESTS_SOURCE" ]; then
    print_error "Source manifests directory not found: $MANIFESTS_SOURCE"
    exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
    print_warning "Directory $TARGET_DIR already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operation cancelled."
        exit 0
    fi
    rm -rf "$TARGET_DIR"
fi

# Create target directory
print_info "Creating directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Copy manifest files
print_info "Copying manifest files from $MANIFESTS_SOURCE to $TARGET_DIR"
cp -r "$MANIFESTS_SOURCE"/* "$TARGET_DIR/"

# Update versions in the copied manifests
print_info "Updating versions to $VERSION in manifest files"

# Find all YAML files in the target directory
find "$TARGET_DIR" -type f \( -name "*.yaml" -o -name "*.yml" \) | while read -r file; do
    print_info "Processing: $(basename "$file")"
    
    # Update image tags from :ci to :$VERSION
    sed -i.bak "s|litmuschaos/litmusportal-frontend:ci|litmuschaos/litmusportal-frontend:${VERSION}|g" "$file"
    sed -i.bak "s|litmuschaos/litmusportal-server:ci|litmuschaos/litmusportal-server:${VERSION}|g" "$file"
    sed -i.bak "s|litmuschaos/litmusportal-auth-server:ci|litmuschaos/litmusportal-auth-server:${VERSION}|g" "$file"
    sed -i.bak "s|litmuschaos/litmusportal-subscriber:ci|litmuschaos/litmusportal-subscriber:${VERSION}|g" "$file"
    sed -i.bak "s|litmuschaos/litmusportal-event-tracker:ci|litmuschaos/litmusportal-event-tracker:${VERSION}|g" "$file"
    sed -i.bak "s|litmuschaos/litmusportal-upgrader:ci|litmuschaos/litmusportal-upgrader:${VERSION}|g" "$file"
    
    # Update any other litmuschaos images with :ci tag
    sed -i.bak "s|litmuschaos/\([^:]*\):ci|litmuschaos/\1:${VERSION}|g" "$file"
    
    # Update VERSION config value
    sed -i.bak "s|VERSION: \"ci\"|VERSION: \"${VERSION}\"|g" "$file"
    
    # Update DEFAULT_HUB_BRANCH_NAME from "master" to version branch (e.g., "3.25.x")
    sed -i.bak "s|DEFAULT_HUB_BRANCH_NAME[[:space:]]*$|DEFAULT_HUB_BRANCH_NAME|g" "$file"
    sed -i.bak "/name: DEFAULT_HUB_BRANCH_NAME/{n;s|value: \"master\"|value: \"${BRANCH_VERSION}\"|g;}" "$file"
    
    # Update WORKFLOW_HELPER_IMAGE_VERSION from "ci" to version
    sed -i.bak "/name: WORKFLOW_HELPER_IMAGE_VERSION/{n;s|value: \"ci\"|value: \"${VERSION}\"|g;}" "$file"
    
    # Update INFRA_COMPATIBLE_VERSIONS from '["ci"]' to '["version"]'
    sed -i.bak "/name: INFRA_COMPATIBLE_VERSIONS/{n;s|value: '\[\"ci\"\]'|value: '[\"${VERSION}\"]'|g;}" "$file"
    
    # Remove backup files
    rm -f "${file}.bak"
done

print_info "Successfully created release manifests for version $VERSION"
print_info "Location: $TARGET_DIR"

# List created files
echo ""
print_info "Created files:"
ls -lh "$TARGET_DIR"

echo ""
print_info "Done! You can now review the manifests in $TARGET_DIR"
