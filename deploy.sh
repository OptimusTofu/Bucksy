#!/bin/bash

# Bucksy Bot Deployment Script

# Function to display help message
show_help() {
    echo "Bucksy Bot Deployment Script"
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start the bot with PM2"
    echo "  stop        - Stop the bot"
    echo "  restart     - Restart the bot"
    echo "  reload      - Reload the bot with zero downtime"
    echo "  status      - Show bot status"
    echo "  logs        - Show bot logs"
    echo "  update      - Pull latest changes, build, and restart"
    echo "  register    - Register slash commands globally"
    echo "  dev         - Start in development mode"
    echo "  reset       - Reset PM2 (fix PM2 errors)"
    echo "  help        - Show this help message"
    echo ""
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &>/dev/null; then
        echo "PM2 is not installed. Installing..."
        npm install -g pm2@latest
    fi
}

# Function to reset PM2 (fix errors)
reset_pm2() {
    echo "Resetting PM2..."
    pm2 kill
    echo "Removing PM2 dump file..."
    rm -rf ~/.pm2/dump.pm2 2>/dev/null
    echo "Clearing PM2 logs..."
    rm -rf ~/.pm2/logs/* 2>/dev/null
    echo "PM2 has been reset. You can now start your bot again."
}

# Function to start the bot
start_bot() {
    echo "Starting Bucksy Bot with PM2..."

    # Check if the bot is already running
    if pm2 list | grep -q "bucksy"; then
        echo "Bucksy Bot is already running. Restarting instead..."
        pm2 restart bucksy || {
            echo "Error restarting bot. Attempting to reset PM2..."
            reset_pm2
            echo "Starting bot after reset..."
            pm2 start ecosystem.config.js
        }
    else
        # Start the bot
        pm2 start ecosystem.config.js || {
            echo "Error starting bot. Attempting to reset PM2..."
            reset_pm2
            echo "Starting bot after reset..."
            pm2 start ecosystem.config.js
        }
    fi

    # Save the PM2 process list
    pm2 save || echo "Warning: Could not save PM2 process list"
}

# Function to stop the bot
stop_bot() {
    echo "Stopping Bucksy Bot..."
    pm2 stop bucksy || {
        echo "Error stopping bot. Attempting to reset PM2..."
        reset_pm2
    }
}

# Function to restart the bot
restart_bot() {
    echo "Restarting Bucksy Bot..."
    pm2 restart bucksy || {
        echo "Error restarting bot. Attempting to reset PM2..."
        reset_pm2
        echo "Starting bot after reset..."
        pm2 start ecosystem.config.js
    }
}

# Function to reload the bot with zero downtime
reload_bot() {
    echo "Reloading Bucksy Bot with zero downtime..."
    pm2 reload bucksy || {
        echo "Error reloading bot. Attempting to restart instead..."
        restart_bot
    }
}

# Function to show bot status
show_status() {
    echo "Bucksy Bot Status:"
    pm2 status bucksy || {
        echo "Error showing status. PM2 might be in an inconsistent state."
        echo "Try resetting PM2 with './deploy.sh reset'"
    }
}

# Function to show bot logs
show_logs() {
    echo "Bucksy Bot Logs:"
    pm2 logs bucksy --lines 50 || {
        echo "Error showing logs. Trying to access log files directly..."
        if [ -f "logs/out.log" ]; then
            echo "Last 50 lines of out.log:"
            tail -n 50 logs/out.log
        fi
        if [ -f "logs/error.log" ]; then
            echo "Last 50 lines of error.log:"
            tail -n 50 logs/error.log
        fi
    }
}

# Function to update the bot
update_bot() {
    echo "Updating Bucksy Bot..."
    git pull
    npm install
    npm run build

    # Check if the bot is running before attempting to restart
    if pm2 list | grep -q "bucksy"; then
        pm2 restart bucksy || {
            echo "Error restarting bot. Attempting to reset PM2..."
            reset_pm2
            echo "Starting bot after reset..."
            pm2 start ecosystem.config.js
        }
    else
        echo "Bot is not running. Starting it..."
        pm2 start ecosystem.config.js || {
            echo "Error starting bot. Attempting to reset PM2..."
            reset_pm2
            echo "Starting bot after reset..."
            pm2 start ecosystem.config.js
        }
    fi

    echo "Bucksy Bot updated successfully!"
}

# Function to register slash commands
register_commands() {
    echo "Registering slash commands globally..."
    npm run register:commands:global
    echo "Slash commands registered successfully!"
}

# Function to start in development mode
start_dev() {
    echo "Starting Bucksy Bot in development mode..."
    pm2 start ecosystem.config.js --env development || {
        echo "Error starting bot in development mode. Attempting to reset PM2..."
        reset_pm2
        echo "Starting bot after reset..."
        pm2 start ecosystem.config.js --env development
    }
}

# Main script logic
check_pm2

# Process command line arguments
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
start)
    start_bot
    ;;
stop)
    stop_bot
    ;;
restart)
    restart_bot
    ;;
reload)
    reload_bot
    ;;
status)
    show_status
    ;;
logs)
    show_logs
    ;;
update)
    update_bot
    ;;
register)
    register_commands
    ;;
dev)
    start_dev
    ;;
reset)
    reset_pm2
    ;;
help)
    show_help
    ;;
*)
    echo "Unknown command: $1"
    show_help
    exit 1
    ;;
esac

exit 0
