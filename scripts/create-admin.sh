#!/bin/bash

# Simple script to create an admin user for Bucksy Admin interface
# This is useful on servers where you want a simpler way to create users

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Bucksy Admin User Creation Tool ===${NC}"
echo "This script will help you create a new admin user for the Bucksy Admin interface."
echo "You'll need to enter a username and password."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Go to project root
cd "$PROJECT_ROOT"

# Run the TypeScript script
echo -e "\n${GREEN}Starting admin user creation process...${NC}"

if [ -f "./node_modules/.bin/ts-node" ]; then
    # Run using local ts-node
    ./node_modules/.bin/ts-node src/scripts/create-admin-user.ts
elif command -v ts-node &>/dev/null; then
    # Run using global ts-node
    ts-node src/scripts/create-admin-user.ts
else
    echo -e "${RED}Error: ts-node is not installed. Please install it first:${NC}"
    echo "npm install -g ts-node"
    exit 1
fi

echo -e "\n${YELLOW}You can now login to the Bucksy Admin interface with your new credentials.${NC}"
