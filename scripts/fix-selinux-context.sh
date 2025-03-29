#!/bin/bash

# Script to fix SELinux context for Bucksy Admin static files
# Run this script with sudo on your production server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing SELinux context for Bucksy Admin static files...${NC}"

# Check if being run as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if SELinux is installed and enabled
if ! command -v getenforce &>/dev/null; then
    echo -e "${RED}SELinux is not installed or not available on this system.${NC}"
    exit 1
fi

SELINUX_STATUS=$(getenforce)
echo -e "SELinux status: ${BLUE}$SELINUX_STATUS${NC}"

if [ "$SELINUX_STATUS" == "Disabled" ]; then
    echo -e "${YELLOW}SELinux is disabled. No context changes needed.${NC}"
    exit 0
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

echo -e "${BLUE}Step 1: Setting SELinux context for Nginx static files${NC}"
echo "Static directory: $STATIC_DIR"

# Check if the SELinux policy module for httpd/nginx is installed
if ! sestatus | grep -q httpd_t; then
    echo -e "${YELLOW}Installing httpd SELinux policy module...${NC}"
    yum install -y policycoreutils-python-utils || dnf install -y policycoreutils-python-utils
fi

# Set the context for the static files directory
echo -e "${BLUE}Setting httpd_sys_content_t context on $STATIC_DIR${NC}"
semanage fcontext -a -t httpd_sys_content_t "$STATIC_DIR(/.*)?"
restorecon -Rv "$STATIC_DIR"

echo -e "\n${BLUE}Step 2: Verifying SELinux context${NC}"
# Check the SELinux context of the files
echo -e "SELinux context for CSS directory:"
ls -Z "$STATIC_DIR/css" | head -n 3

echo -e "\n${BLUE}Step 3: Additional SELinux settings for Nginx${NC}"

# Allow Nginx to connect to Node.js application (if needed)
echo -e "Allowing Nginx to connect to network services..."
setsebool -P httpd_can_network_connect 1

# If using non-standard ports, ensure they're allowed in SELinux
HTTP_PORT=$(grep -oP 'listen\s+\K\d+' /etc/nginx/sites-available/bucksy-admin.conf 2>/dev/null | head -1)
if [ ! -z "$HTTP_PORT" ] && [ "$HTTP_PORT" != "80" ] && [ "$HTTP_PORT" != "443" ]; then
    echo -e "Adding SELinux port permission for non-standard port $HTTP_PORT..."
    semanage port -a -t http_port_t -p tcp $HTTP_PORT || semanage port -m -t http_port_t -p tcp $HTTP_PORT
fi

echo -e "\n${GREEN}SELinux context has been fixed for Nginx static files!${NC}"
echo -e "Please restart Nginx to apply the changes:"
echo -e "${BLUE}systemctl restart nginx${NC}"

echo -e "\n${YELLOW}If you continue to experience issues, you can temporarily set SELinux to permissive mode:${NC}"
echo -e "${BLUE}setenforce 0${NC}"
echo -e "(This will revert to enforcing mode after reboot unless you modify /etc/selinux/config)"

echo -e "\n${YELLOW}Debugging commands:${NC}"
echo -e "1. Check SELinux denials: ${BLUE}ausearch -m avc --start recent${NC}"
echo -e "2. Generate allow policy: ${BLUE}audit2allow -a -M mynginx${NC}"
echo -e "3. Apply policy: ${BLUE}semodule -i mynginx.pp${NC}"

exit 0
