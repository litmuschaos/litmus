#!/bin/bash

# Litmus Local Development Setup Script
# This script launches all required services in separate terminal windows

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

MONGO_VERSION="4.2"
DB_USER="admin"
DB_PASSWORD="1234"

echo -e "${GREEN}Starting Litmus Local Development Environment${NC}"

# Function to detect terminal emulator
detect_terminal() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "osascript"
    elif command -v gnome-terminal &> /dev/null; then
        echo "gnome-terminal"
    elif command -v konsole &> /dev/null; then
        echo "konsole"
    elif command -v xterm &> /dev/null; then
        echo "xterm"
    else
        echo "unknown"
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Function to check /etc/hosts entry
check_hosts_file() {
    if ! grep -q "127.0.0.1 m1 m2 m3" /etc/hosts; then
        echo -e "${YELLOW}/etc/hosts missing Mongo entries. Adding them...${NC}"
        echo "127.0.0.1 m1 m2 m3" | sudo tee -a /etc/hosts >/dev/null
        echo -e "${GREEN}Hosts entry added successfully.${NC}"
    fi
}

wait_for_mongo() {
    local port=$1
    local container=$2
    local max_attempts=30
    local attempt=0
    
    echo "Waiting for MongoDB on port $port..."
    while [ $attempt -lt $max_attempts ]; do
        if docker exec "$container" mongo --port "$port" --eval "db.runCommand({ ping: 1 })" &> /dev/null; then
            echo "MongoDB ($container) is ready on port $port"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}MongoDB failed to start on port $port${NC}"
    return 1
}

# Function to setup MongoDB
setup_mongodb() {
    echo -e "${GREEN}Setting up MongoDB cluster...${NC}"
    
    # Clean up existing containers if any
    docker rm -f m1 m2 m3 2>/dev/null || true
    docker network rm mongo-cluster 2>/dev/null || true
    
    docker pull mongo:$MONGO_VERSION
    
    docker network create mongo-cluster
    
    # Start MongoDB containers
    docker run -d --net mongo-cluster -p 27015:27015 --name m1 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27015
    docker run -d --net mongo-cluster -p 27016:27016 --name m2 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27016
    docker run -d --net mongo-cluster -p 27017:27017 --name m3 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27017
    
    # Wait for MongoDB to be ready
    wait_for_mongo 27015 m1
    wait_for_mongo 27016 m2
    wait_for_mongo 27017 m3
    
    # Initialize replica set
    echo "Initializing replica set..."
    docker exec m1 mongo --port 27015 --eval '
    config={
        "_id":"rs0",
        "members":[
            {"_id":0,"host":"m1:27015"},
            {"_id":1,"host":"m2:27016"},
            {"_id":2,"host":"m3:27017"}
        ]
    };
    rs.initiate(config);
    '
    
    # Wait for primary election
    echo "Waiting for primary election..."
    local max_wait=30
    local count=0
    while [ $count -lt $max_wait ]; do
        if docker exec m1 mongo --port 27015 --quiet --eval "rs.isMaster().ismaster" 2>/dev/null | grep -q "true"; then
            echo "Primary elected successfully"
            break
        fi
        echo "Waiting for primary... ($count/$max_wait)"
        sleep 2
        count=$((count + 2))
    done
    
    if [ $count -ge $max_wait ]; then
        echo -e "${RED}Timeout waiting for primary election${NC}"
        return 1
    fi
    
    sleep 3
    
    # Create admin user
    echo "Creating admin user..."
    docker exec m1 mongo --port 27015 --eval "
    db.getSiblingDB('admin').createUser({
        user:'$DB_USER',
        pwd:'$DB_PASSWORD',
        roles:[{role:'root',db:'admin'}]
    });
    "
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create admin user${NC}"
        return 1
    fi
    
    echo -e "${GREEN}MongoDB setup complete!${NC}"
}

# Function to launch in new terminal
launch_terminal() {
    local title=$1
    local command=$2
    local terminal=$(detect_terminal)
    
    case $terminal in
"osascript")
    encoded_cmd=$(printf "%s" "$command" | base64)

    osascript <<EOF
tell application "Terminal"
    do script "bash -c 'cd \"$PROJECT_ROOT\"; echo \"=== $title ===\"; eval \"\$(echo $encoded_cmd | base64 --decode)\"; exec \$SHELL'"
    activate
end tell
EOF
    ;;

        "gnome-terminal")
            gnome-terminal --title="$title" -- bash -c "cd '$PROJECT_ROOT' && echo '=== $title ===' && $command; exec bash"
            ;;
        "konsole")
            konsole --title "$title" -e bash -c "cd '$PROJECT_ROOT' && echo '=== $title ===' && $command; exec bash" &
            ;;
        "xterm")
            xterm -title "$title" -e bash -c "cd '$PROJECT_ROOT' && echo '=== $title ===' && $command; exec bash" &
            ;;
        *)
            echo -e "${RED}Could not detect terminal emulator${NC}"
            echo "Please run this command manually in a new terminal:"
            echo "$command"
            ;;
    esac
    
    sleep 1
}

# Main execution
main() {
    check_docker

    check_hosts_file
    
    setup_mongodb
    
    echo -e "${GREEN}MongoDB is ready. Launching application services...${NC}"
    
    sleep 2
    # Launch API server
    echo "Launching API server..."
    RAW_INFRA_VERSIONS=$(grep '^INFRA_COMPATIBLE_VERSIONS=' "$SCRIPT_DIR/.env.auth" | cut -d'=' -f2-)
    export INFRA_COMPATIBLE_VERSIONS="'$RAW_INFRA_VERSIONS'"

    API_CMD="set -a; source \"$SCRIPT_DIR/.env.auth\"; export INFRA_COMPATIBLE_VERSIONS='$RAW_INFRA_VERSIONS'; set +a; cd chaoscenter/authentication/api && go run main.go"
    launch_terminal "Litmus API" "$API_CMD"
    sleep 3
    echo "Launching GraphQL server..."

    GRAPHQL_CMD="set -a; source \"$SCRIPT_DIR/.env.api\"; export INFRA_COMPATIBLE_VERSIONS='$RAW_INFRA_VERSIONS'; set +a; cd chaoscenter/graphql/server && go run server.go"
    launch_terminal "Litmus GraphQL" "$GRAPHQL_CMD"
    sleep 2
    
    # Launch Frontend
    echo "Launching Frontend..."
    FRONTEND_CMD="cd chaoscenter/web && yarn && yarn generate-certificate && yarn dev"
    launch_terminal "Litmus Frontend" "$FRONTEND_CMD"
    
    echo -e "${GREEN}All services launched successfully!${NC}"
    echo -e "${YELLOW}Note: Check individual terminal windows for service status${NC}"
    echo ""
    echo "Services:"
    echo "  - MongoDB: ports 27015, 27016, 27017"
    echo "  - API: check API terminal for port"
    echo "  - GraphQL: check GraphQL terminal for port"
    echo "  - Frontend: check Frontend terminal for port"
}

main