# Legacy JavaScript Code

This directory contains the original JavaScript code for the Bucksy Discord bot before it was migrated to TypeScript.

## Purpose

This code is kept for reference purposes and to help with the migration process. It should not be used in production.

## Structure

The directory structure mirrors the original project:

```
old/
├── commands/       # Bot commands organized by category
│   ├── games/      # Game-related commands
│   ├── misc/       # Miscellaneous commands
│   ├── moderation/ # Moderation commands
│   └── roles/      # Role management commands
├── controllers/    # Controllers for external services
├── events/         # Discord.js event handlers
├── util/           # Utility functions
└── index.js        # Main entry point
```

## Migration Status

The code in this directory has been migrated to TypeScript and can be found in the `src/` directory of the main project. The TypeScript version includes:

- Type definitions for all data structures
- Improved error handling
- Better code organization
- Unit tests
- Updated dependencies

## Differences

The TypeScript version includes several improvements over this legacy code:

1. **Type Safety**: All functions and variables have proper type annotations
2. **Error Handling**: Comprehensive try/catch blocks and error reporting
3. **Async/Await**: Consistent use of async/await instead of callbacks
4. **Connection Pooling**: MongoDB connection pooling for better performance
5. **Feature Enhancements**: Additional features and improvements to existing ones
6. **Testing**: Unit tests for controllers and commands

## Usage

This code should not be used directly. It is kept only for reference purposes during the migration process. 