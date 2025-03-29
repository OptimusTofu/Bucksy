#!/bin/bash

# Check for SELinux denials related to Nginx/httpd
# Run with sudo on your production server

echo "Checking for SELinux denials related to Nginx/httpd..."
ausearch -m avc --start recent | grep -E 'httpd|nginx' || echo "No SELinux denials found for Nginx."

echo -e "\nChecking file contexts for CSS directory..."
CSS_DIR="$(dirname "$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")")/dist/admin/public/css"
if [ -d "$CSS_DIR" ]; then
    ls -Z "$CSS_DIR" | head -n 5
else
    echo "CSS directory not found: $CSS_DIR"
fi

echo -e "\nQuick fix commands:"
echo "1. Set SELinux to permissive mode for testing: sudo setenforce 0"
echo "2. Run full fix script: sudo ./scripts/fix-selinux-context.sh"
echo "3. Restart Nginx: sudo systemctl restart nginx"
