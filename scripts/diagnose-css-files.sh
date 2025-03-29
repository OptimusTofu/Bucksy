#!/bin/bash

# Script to diagnose CSS file access issues
# Run this script with sudo if needed to access certain directories

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Bucksy Admin CSS File Diagnostic Tool${NC}"
echo "--------------------------------------"

# Get the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Define paths to check
STATIC_DIR="$PROJECT_DIR/dist/admin/public"
CSS_DIR="$STATIC_DIR/css"
SRC_CSS_DIR="$PROJECT_DIR/src/admin/public/css"

echo -e "${BLUE}Step 1: Checking directory structure${NC}"
echo "Project directory: $PROJECT_DIR"

# Check if directories exist
echo -n "Static directory ($STATIC_DIR): "
if [ -d "$STATIC_DIR" ]; then
    echo -e "${GREEN}Exists${NC}"
else
    echo -e "${RED}Not found${NC} - Run 'npm run build' to create it"
fi

echo -n "CSS directory ($CSS_DIR): "
if [ -d "$CSS_DIR" ]; then
    echo -e "${GREEN}Exists${NC}"
else
    echo -e "${RED}Not found${NC} - CSS files haven't been built/copied"
fi

echo -n "Source CSS directory ($SRC_CSS_DIR): "
if [ -d "$SRC_CSS_DIR" ]; then
    echo -e "${GREEN}Exists${NC}"
else
    echo -e "${RED}Not found${NC} - Source CSS files are missing"
fi

echo -e "\n${BLUE}Step 2: Checking CSS files${NC}"

# Check CSS files
CSS_FILES=("styles.css" "dark-theme.css")

for FILE in "${CSS_FILES[@]}"; do
    # Check source file
    SRC_FILE="$SRC_CSS_DIR/$FILE"
    echo -n "Source file ($SRC_FILE): "
    if [ -f "$SRC_FILE" ]; then
        echo -e "${GREEN}Exists${NC}"
    else
        echo -e "${RED}Not found${NC} - Source file is missing"
    fi

    # Check built file
    BUILT_FILE="$CSS_DIR/$FILE"
    echo -n "Built file ($BUILT_FILE): "
    if [ -f "$BUILT_FILE" ]; then
        echo -e "${GREEN}Exists${NC}"
    else
        echo -e "${RED}Not found${NC} - Build process didn't copy this file"
    fi
done

echo -e "\n${BLUE}Step 3: Checking permissions${NC}"

# Detect the nginx user
if getent passwd www-data >/dev/null; then
    NGINX_USER="www-data"
elif getent passwd nginx >/dev/null; then
    NGINX_USER="nginx"
else
    NGINX_USER="unknown"
fi

echo "Nginx user: $NGINX_USER"

if [ -d "$CSS_DIR" ]; then
    # Check directory permissions
    DIR_PERMS=$(stat -c "%a" "$CSS_DIR" 2>/dev/null || stat -f "%Lp" "$CSS_DIR" 2>/dev/null)
    echo "CSS directory permissions: $DIR_PERMS (should be at least 755)"

    # Check file permissions
    for FILE in "${CSS_FILES[@]}"; do
        BUILT_FILE="$CSS_DIR/$FILE"
        if [ -f "$BUILT_FILE" ]; then
            FILE_PERMS=$(stat -c "%a" "$BUILT_FILE" 2>/dev/null || stat -f "%Lp" "$BUILT_FILE" 2>/dev/null)
            echo "$FILE permissions: $FILE_PERMS (should be at least 644)"
        fi
    done

    # Check ownership (unix-like systems)
    if [ "$(uname)" != "Darwin" ]; then
        DIR_OWNER=$(stat -c "%U:%G" "$CSS_DIR" 2>/dev/null)
        echo "CSS directory owner: $DIR_OWNER (should include $NGINX_USER)"
    else
        echo "Running on macOS - skipping ownership check"
    fi
fi

echo -e "\n${BLUE}Step 4: Rebuild and fix suggestions${NC}"

echo "1. Rebuild the admin files:"
echo "   npm run build"

echo -e "\n2. Fix permissions (run as root/sudo):"
echo "   sudo chown -R $NGINX_USER:$NGINX_USER $STATIC_DIR"
echo "   sudo find $STATIC_DIR -type d -exec chmod 755 {} \;"
echo "   sudo find $STATIC_DIR -type f -exec chmod 644 {} \;"

echo -e "\n3. Update your nginx configuration:"
echo "   - Make sure the root path is correct: $STATIC_DIR"
echo "   - Add a specific CSS location block:"
echo '   location ^~ /css/ {'
echo '       access_log off;'
echo '       expires 7d;'
echo '       add_header Cache-Control "public, max-age=604800";'
echo '       try_files $uri =404;'
echo '   }'

echo -e "\n4. Check Nginx configuration:"
echo "   sudo nginx -t"
echo "   sudo systemctl restart nginx"

echo -e "\n5. Test CSS file access directly:"
echo "   curl -I https://admin.yourdomain.com/css/styles.css"

echo -e "\n${YELLOW}Diagnostic complete${NC}"
