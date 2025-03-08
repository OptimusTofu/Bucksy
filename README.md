# Bucksy

## A simple discord.js bot to help manage a pokemon server

<div align="center">

[![GitHub version](https://badge.fury.io/gh/0x736a64%2FBucksy.svg)](https://badge.fury.io/gh/0x736a64%2FBucksy)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Issues](https://img.shields.io/github/issues-raw/0x736a64/Bucksy.svg?maxAge=25000)](https://github.com/0x736a64/Bucksy/issues)  
[![GitHub last commit](https://img.shields.io/github/last-commit/0x736a64/Bucksy.svg?style=flat)](https://img.shields.io/github/last-commit/0x736a64/Bucksy.svg?style=flat)

</div>

## Recent Improvements

- **Updated Dependencies**: All packages have been updated to their latest versions, including discord.js v14.
- **Database Connection Pooling**: Implemented connection pooling for MongoDB to improve performance and resource usage.
- **TypeScript Migration**: Converted the codebase to TypeScript for better type safety and developer experience.
- **Comprehensive Type System**: Created a robust type system with interfaces for all data structures, properly aligned with Discord.js types.
- **Command & Event System**: Refactored commands and events to use TypeScript with improved error handling and type safety.
- **Feature-Rich Controllers**: Implemented controllers with robust functionality for QOTD, Who's That Pokemon, AI chat, and more.
- **Unit Testing**: Added Jest tests for controllers and commands to ensure code quality and prevent regressions.
- **Code Organization**: Better code structure with proper separation of concerns.

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Discord bot token and other environment variables
4. Build the TypeScript code with `npm run build`
5. Start the bot with `npm start`

## Development

- `npm run dev` - Start the bot in development mode with ts-node
- `npm run build` - Build the TypeScript code
- `npm run watch` - Watch for changes and rebuild
- `npm run prettify` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
src/
├── commands/       # Bot commands organized by category
│   ├── games/      # Game-related commands
│   ├── misc/       # Miscellaneous commands
│   ├── moderation/ # Moderation commands
│   └── roles/      # Role management commands
├── controllers/    # Controllers for external services
├── events/         # Discord.js event handlers
├── tests/          # Unit tests
│   ├── commands/   # Tests for commands
│   └── controllers/# Tests for controllers
├── types/          # TypeScript type definitions
│   ├── bot.ts      # Bot-related types
│   ├── config.ts   # Configuration types
│   ├── database.ts # Database model types
│   ├── discord.ts  # Discord.js specific types
│   ├── games.ts    # Game-related types
│   ├── utils.ts    # Utility types
│   └── index.ts    # Type exports
├── util/           # Utility functions
└── index.ts        # Main entry point

old/                # Legacy JavaScript code (for reference only)
```

## Features

### Database
- MongoDB connection pooling for improved performance
- Typed database models and operations
- Error handling and retry mechanisms

### Commands
- Prefix-based command system
- Command cooldowns and permissions
- Channel-specific commands
- Aliases for commands

### Games
- Slot machine with rewards
- Who's That Pokemon guessing game
- Points system for users

### Utilities
- Question of the Day from Reddit
- AI chat assistant
- Welcome and goodbye messages
- Rare Pokemon notifications

## Type System

The project uses a comprehensive type system to ensure type safety and improve developer experience:

### Bot Types
- `BotCommand`: Interface for command structure with proper Discord.js types
- `BotEvent`: Generic interface for event handlers with proper Discord.js event types
- `BucksyClient`: Extended Discord.js Client class with custom properties

### Discord Types
- `MessageContext`: Context object for command execution
- `CommandResult`: Result of command execution
- `PermissionCheckResult`: Result of permission checks
- `ReactionContext`: Context for reaction events

### Database Types
- `User`, `Shiny`, `Question`: MongoDB document interfaces
- `DatabaseCollections`: Interface for database collections
- Various result interfaces for database operations

### Game Types
- `SlotResult`: Result of slot machine spins
- `BalanceOperation`: Interface for balance operations
- `Purchase`: Interface for purchases
- `GameSettings`: Interface for game settings

### Utility Types
- Various utility types for common patterns

## Legacy Code

The original JavaScript code has been moved to the `old/` directory for reference purposes. This code should not be used in production. See the [Legacy Code README](old/README.md) for more information.

## Commands

The bot supports various commands for games, moderation, and role management:

### Games
- `!spin` - Spin a slot machine for rewards
- `!register` - Register to the points system
- `!balance` - Check your points balance
- `!spend` - Spend points on items

### Moderation
- Various moderation commands for server management

### Roles
- Commands for managing roles in the server
