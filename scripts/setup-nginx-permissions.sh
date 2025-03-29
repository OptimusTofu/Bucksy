#!/bin/bash

# Script to set up the correct permissions for the Bucksy Admin static files
# Run this script with sudo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up permissions for Bucksy Admin static files...${NC}"

# Check if being run as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get the project directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Path to the static assets directory
STATIC_DIR="$PROJECT_DIR/dist/admin/public"

# Check if the directory exists
if [ ! -d "$STATIC_DIR" ]; then
    echo -e "${RED}Static directory not found: $STATIC_DIR${NC}"
    echo -e "${YELLOW}Did you run 'npm run build' first?${NC}"
    exit 1
fi

# Set the nginx user and group
# Debian/Ubuntu typically uses 'www-data', CentOS/RHEL uses 'nginx'
# Automatically detect the nginx user
if getent passwd www-data >/dev/null; then
    NGINX_USER="www-data"
    NGINX_GROUP="www-data"
elif getent passwd nginx >/dev/null; then
    NGINX_USER="nginx"
    NGINX_GROUP="nginx"
else
    echo -e "${RED}Cannot detect nginx user. Please edit this script to specify the correct user.${NC}"
    exit 1
fi

echo -e "${YELLOW}Using nginx user: $NGINX_USER${NC}"

# Set ownership for the static directory
echo "Setting ownership for $STATIC_DIR to $NGINX_USER:$NGINX_GROUP"
chown -R $NGINX_USER:$NGINX_GROUP "$STATIC_DIR"

# Set permissions
echo "Setting permissions for $STATIC_DIR"
find "$STATIC_DIR" -type d -exec chmod 755 {} \;
find "$STATIC_DIR" -type f -exec chmod 644 {} \;

echo -e "${GREEN}Permissions set successfully!${NC}"
echo -e "${YELLOW}Please update your nginx config to point to: $STATIC_DIR${NC}"

# Display the correct configuration settings
echo -e "${YELLOW}Add these lines to your nginx config:${NC}"
echo -e "${GREEN}    root $STATIC_DIR;${NC}"
echo -e ""
echo -e "${YELLOW}Verify nginx config:${NC}"
echo -e "${GREEN}    sudo nginx -t${NC}"
echo -e ""
echo -e "${YELLOW}Restart nginx:${NC}"
echo -e "${GREEN}    sudo systemctl restart nginx${NC}"

exit 0
