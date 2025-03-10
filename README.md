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
- **Slash Commands**: Implemented Discord.js v14 slash commands for a better user experience.
- **Feature-Rich Controllers**: Implemented controllers with robust functionality for QOTD, Who's That Pokemon, AI chat, and more.
- **Unit Testing**: Added Jest tests for controllers and commands to ensure code quality and prevent regressions.
- **Code Organization**: Better code structure with proper separation of concerns.

## Documentation

- [README.md](README.md) - Main documentation
- [MIGRATION.md](MIGRATION.md) - Migration from JavaScript to TypeScript
- [SLASH_COMMANDS.md](SLASH_COMMANDS.md) - Detailed documentation for slash commands

## Setup

### Prerequisites
- Node.js 16.9.0 or higher
- MongoDB instance (local or remote)
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/0x736a64/Bucksy.git
   cd Bucksy
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Build the TypeScript code
   ```bash
   npm run build
   ```

5. Register slash commands
   - For development (guild-specific, updates instantly):
     ```bash
     npm run register:commands
     ```
   - For production (global, updates take up to an hour):
     ```bash
     npm run register:commands:global
     ```

6. Start the bot
   ```bash
   npm start
   ```

## Development

- `npm run dev` - Start the bot in development mode with ts-node
- `npm run build` - Build the TypeScript code
- `npm run watch` - Watch for changes and rebuild
- `npm run prettify` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run register:commands` - Register slash commands for a specific guild (faster updates during development)
- `npm run register:commands:global` - Register global slash commands (slower updates, use in production)

## Project Structure

```
src/
├── commands/       # Legacy prefix commands
│   ├── games/      # Game-related commands
│   ├── misc/       # Miscellaneous commands
│   ├── moderation/ # Moderation commands
│   └── roles/      # Role management commands
├── slashCommands/  # Discord.js v14 slash commands
│   ├── games/      # Game-related slash commands
│   └── ...         # Other slash command categories
├── controllers/    # Controllers for external services
├── events/         # Discord.js event handlers
├── scripts/        # Utility scripts
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
- Automatic reconnection on connection loss

### Commands
- Prefix-based command system (legacy)
- Slash commands for better user experience
- Command cooldowns and permissions
- Channel-specific commands
- Aliases for commands

### Games
- Slot machine with rewards
- Who's That Pokemon guessing game
- Points system for users
- Leaderboard system

### Utilities
- Question of the Day from Reddit
- AI chat assistant
- Welcome and goodbye messages
- Rare Pokemon notifications

## Slash Commands

The bot uses Discord.js v14 slash commands for a modern user experience:

### Implementation
- **Command Registration**: Automatic registration of commands via dedicated scripts
- **Interaction Handling**: Centralized controller for handling all interactions
- **Type Safety**: Strong TypeScript typing for all command components
- **Error Handling**: Comprehensive error handling and user feedback
- **Permissions**: Permission checking for commands
- **Cooldowns**: Command cooldown system to prevent spam

### Available Commands
- `/balance` - Check your points balance
- `/register` - Register to the points system
- `/spin` - Spin a slot machine for rewards
- `/spend` - Spend points on items

### Creating New Commands
To create a new slash command:

1. Create a new file in the appropriate category folder in `src/slashCommands/`
2. Use the following template:
   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
   import { BucksyClient, SlashCommand, SlashCommandResult } from '../../types';

   const command: SlashCommand = {
       data: new SlashCommandBuilder()
           .setName('command-name')
           .setDescription('Command description'),

       options: {
           guildOnly: true,
           cooldown: 5
       },

       async execute(interaction: ChatInputCommandInteraction, client: BucksyClient): Promise<SlashCommandResult> {
           try {
               // Command implementation
               await interaction.reply({ content: 'Command executed!' });
               
               return {
                   success: true
               };
           } catch (error) {
               console.error('Error in command:', error);
               
               return {
                   success: false,
                   error: 'An error occurred while processing your request.'
               };
           }
       }
   };

   export default command;
   ```
3. Register the command using `npm run register:commands`

For more detailed information about slash commands, see [SLASH_COMMANDS.md](SLASH_COMMANDS.md).

## Type System

The project uses a comprehensive type system to ensure type safety and improve developer experience:

### Bot Types
- `BotCommand`: Interface for command structure with proper Discord.js types
- `SlashCommand`: Interface for slash command structure
- `BotEvent`: Generic interface for event handlers with proper Discord.js event types
- `BucksyClient`: Extended Discord.js Client class with custom properties

### Discord Types
- `MessageContext`: Context object for command execution
- `CommandResult`: Result of command execution
- `SlashCommandResult`: Result of slash command execution
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

## Contributing

We welcome contributions to Bucksy! Here's how you can help:

### Setting Up Development Environment
1. Fork the repository
2. Clone your fork
3. Install dependencies with `npm install`
4. Create a `.env` file with your development bot token
5. Make your changes
6. Run tests with `npm test`
7. Submit a pull request

### Coding Standards
- Follow the existing code style
- Use TypeScript for all new code
- Write JSDoc comments for all functions and classes
- Add unit tests for new features
- Update documentation when necessary

### Pull Request Process
1. Ensure your code passes all tests
2. Update the README.md with details of changes if applicable
3. Update the MIGRATION.md if you're making significant changes
4. The PR will be merged once it has been reviewed and approved

## Legacy Code

The original JavaScript code has been moved to the `old/` directory for reference purposes. This code should not be used in production. See the [Legacy Code README](old/README.md) for more information.

## Commands

The bot supports various commands for games, moderation, and role management:

### Prefix Commands (Legacy)
- `!spin` - Spin a slot machine for rewards
- `!register` - Register to the points system
- `!balance` - Check your points balance
- `!spend` - Spend points on items

### Slash Commands
- `/spin` - Spin a slot machine for rewards
- `/register` - Register to the points system
- `/balance` - Check your points balance
- `/spend` - Spend points on items

### Moderation
- Various moderation commands for server management

### Roles
- Commands for managing roles in the server

## License

This project is licensed under the ISC License - see the LICENSE file for details.
