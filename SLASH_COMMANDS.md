# Bucksy Slash Commands Documentation

## Admin Commands

All admin commands require the `Manage Roles` permission and can only be used in the admin channel.

### Role Management
- `/add-role <user> <role>` - Add a role to a user
- `/remove-role <user> <role>` - Remove a role from a user
- `/list-roles <user>` - List all roles for a user
- `/manage-roles` - Manage server roles (create, delete, edit)

### Channel Management
- `/manage-channels` - Manage server channels
  - Create new channels
  - Delete existing channels
  - Edit channel properties
  - List all channels

### User Management
- `/add-admin <user>` - Add a user as admin
- `/remove-admin <user>` - Remove admin status from a user
- `/list-admins` - List all admin users
- `/clear-warnings <user>` - Clear warnings for a user

### Server Settings
- `/server-settings` - View and modify server settings
- `/automod-settings` - Configure automod settings
  - Add/remove banned words
  - Enable/disable features
  - Set warning thresholds

### Game Management
- `/add-shiny <pokemon>` - Add a shiny Pokemon to the database
- `/remove-shiny <pokemon>` - Remove a shiny Pokemon
- `/add-question <text>` - Add a new question to the database
- `/remove-question <text>` - Remove a question

## User Commands

### Points System
- `/register` - Register for the points system
- `/balance` - Check your points balance
- `/spend <amount>` - Spend points on items
- `/spin` - Play the slot machine (costs 10 points)

### Role Commands
- `/iam <role>` - Add a self-assignable role
- `/iamnot <role>` - Remove a self-assignable role
- `/want <role>` - Add a role to your wishlist
- `/unwant <role>` - Remove a role from your wishlist

### Games
- `/guess` - Play "Who's That Pokemon?"
- `/trivia` - Play Pokemon trivia
- `/count` - Participate in Pokemon counting challenge

### Utility
- `/help` - Show command help
- `/ping` - Check bot latency
- `/serverinfo` - View server information
- `/userinfo [user]` - View user information

## Points System Details

### Starting Points
- New users start with 500 points

### Earning Points
- Correct Pokemon guesses: 100 points
- Trivia games: 50-200 points
- Slot machine: 10-5000 points
- Daily activities

### Spending Points
- Slot machine spins: 10 points
- Special items
- Role purchases

## Command Usage Examples

### Admin Commands
```bash
# Add a role to a user
/add-role @user @role

# Create a new channel
/manage-channels action:create name:announcements type:text

# Add an admin user
/add-admin @user

# Add a shiny Pokemon
/add-shiny Pikachu
```

### User Commands
```bash
# Register for points
/register

# Check balance
/balance

# Play slot machine
/spin

# Add a role
/iam @role

# Play Pokemon guessing game
/guess
```

## Command Permissions

### Admin Commands
- Required Permission: `Manage Roles`
- Channel Restriction: Admin channel only
- Role Requirements: Admin role

### User Commands
- No special permissions required
- Available in all channels
- Some commands may have cooldowns

## Command Cooldowns

- `/spin`: 5 minutes
- `/guess`: 1 minute
- `/trivia`: 2 minutes
- Role commands: 1 minute

## Error Handling

All commands provide clear error messages for:
- Invalid permissions
- Missing parameters
- Invalid input
- Cooldown periods
- Database errors

## Support

For issues or questions about commands:
1. Check the error message for guidance
2. Contact a server administrator
3. Use `/help` for command information 