# Bucksy Bot Deployment Guide

This guide explains how to deploy and manage the Bucksy Discord bot using PM2 process manager.

## Prerequisites

- Node.js 16.9.0 or higher
- MongoDB instance
- Discord Bot Token
- PM2 (`npm install -g pm2`)

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bucksy.bot.git
   cd bucksy.bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```
   NODE_ENV=production
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   MONGODB_URI=mongodb://username:password@hostname:27017/database?authSource=admin
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Register slash commands:
   ```bash
   npm run register:commands:global
   ```

## Deployment with PM2

### Using the Deployment Script

The easiest way to deploy and manage Bucksy is using the included deployment script:

```bash
# Make the script executable (first time only)
chmod +x deploy.sh

# Show available commands
./deploy.sh help

# Start the bot
./deploy.sh start

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Update the bot (pulls latest code, builds, and restarts)
./deploy.sh update
```

### Using npm Scripts

You can also use the npm scripts defined in package.json:

```bash
# Start with PM2
npm run pm2:start

# Stop the bot
npm run pm2:stop

# Restart the bot
npm run pm2:restart

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Start in development mode
npm run pm2:dev
```

### Manual PM2 Commands

If you prefer to use PM2 directly:

```bash
# Start using the ecosystem file
pm2 start ecosystem.config.js

# Start with specific environment
pm2 start ecosystem.config.js --env production

# List all processes
pm2 list

# Show detailed information
pm2 show bucksy

# View logs
pm2 logs bucksy

# Monitor CPU/Memory usage
pm2 monit

# Save the current process list
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

## PM2 Configuration

The bot uses an `ecosystem.config.js` file for PM2 configuration. Key settings include:

- **Memory Limit**: The bot will restart if it exceeds 300MB of memory
- **Auto Restart**: The bot will automatically restart if it crashes
- **Cron Restart**: The bot will restart daily at midnight
- **Logs**: Logs are stored in the `logs` directory

You can modify these settings in the `ecosystem.config.js` file.

## Updating the Bot

To update the bot to the latest version:

```bash
# Pull the latest changes
git pull

# Install any new dependencies
npm install

# Rebuild the TypeScript code
npm run build

# Restart the bot
pm2 restart bucksy
```

Or simply use:

```bash
./deploy.sh update
```

## Troubleshooting

### Bot Crashes on Startup

Check the logs for errors:

```bash
pm2 logs bucksy
```

Common issues:
- Invalid Discord token
- MongoDB connection issues
- Missing environment variables

### PM2 Error: "Cannot read properties of undefined (reading 'pm2_env')"

This error occurs when PM2 is in an inconsistent state. To fix it:

1. Use the reset command in the deployment script:
   ```bash
   ./deploy.sh reset
   ```

2. Or manually reset PM2:
   ```bash
   # Kill all PM2 processes
   pm2 kill

   # Remove the PM2 dump file
   rm -rf ~/.pm2/dump.pm2

   # Clear PM2 logs
   rm -rf ~/.pm2/logs/*

   # Start the bot again
   pm2 start ecosystem.config.js
   ```

3. If the error persists, try reinstalling PM2:
   ```bash
   # Uninstall PM2
   npm uninstall -g pm2

   # Install the latest version
   npm install -g pm2@latest

   # Start the bot
   pm2 start ecosystem.config.js
   ```

### High Memory Usage

If the bot is using too much memory, you can adjust the memory limit in `ecosystem.config.js`:

```javascript
max_memory_restart: '500M' // Increase to 500MB
```

### PM2 Process Disappears After Server Restart

You need to save the PM2 process list and set up PM2 to start on boot:

```bash
pm2 save
pm2 startup
```

Follow the instructions provided by the `pm2 startup` command.

## Monitoring

PM2 provides several ways to monitor your bot:

```bash
# Basic status information
pm2 status

# Detailed metrics
pm2 monit

# Web-based dashboard (requires PM2 Plus)
pm2 plus
```

## Logs

Logs are stored in the `logs` directory:

- `logs/out.log` - Standard output
- `logs/error.log` - Error logs

You can view logs using:

```bash
pm2 logs bucksy
```

Or directly access the log files:

```bash
tail -f logs/error.log
``` 