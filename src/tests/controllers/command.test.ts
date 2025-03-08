import { Message, Collection } from 'discord.js';
import { BucksyClient, BotCommand } from '../../types';
import * as commandController from '../../controllers/command';

// Mock the Message object
const createMockMessage = (content: string, isBot = false, guildId: string | null = 'mockGuildId', channelId = 'mockChannelId') => {
    return {
        content,
        author: {
            bot: isBot,
            id: 'mockUserId',
            tag: 'mockUser#1234'
        },
        guild: guildId ? {
            id: guildId
        } : null,
        channel: {
            id: channelId,
            send: jest.fn().mockResolvedValue({}),
            isTextBased: () => true
        },
        reply: jest.fn().mockResolvedValue({}),
        client: {
            commands: new Collection<string, BotCommand>(),
            config: {
                prefix: ['!', '?', '.'],
                channels: {
                    pvp: {
                        id: 'pvpChannelId',
                        name: 'pvp'
                    }
                }
            }
        }
    } as unknown as Message;
};

// Mock the BucksyClient
const mockClient = {
    commands: new Collection<string, BotCommand>(),
    config: {
        prefix: ['!', '?', '.'],
        channels: {
            pvp: {
                id: 'pvpChannelId',
                name: 'pvp'
            }
        }
    }
} as unknown as BucksyClient;

// Mock the prefixExists function
jest.mock('../../util/prefixExists', () => ({
    prefixExists: jest.fn().mockImplementation((msg) => {
        return msg.content.startsWith('!') || msg.content.startsWith('?') || msg.content.startsWith('.');
    })
}));

describe('Command Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset the commands collection
        mockClient.commands.clear();

        // Add a mock command
        const mockCommand: BotCommand = {
            name: 'test',
            description: 'A test command',
            usage: '',
            execute: jest.fn().mockResolvedValue({ success: true, message: 'Test command executed' })
        };

        mockClient.commands.set('test', mockCommand);

        // Add a guild-only command
        const guildOnlyCommand: BotCommand = {
            name: 'guildonly',
            description: 'A guild-only command',
            usage: '',
            guildOnly: true,
            execute: jest.fn().mockResolvedValue({ success: true, message: 'Guild-only command executed' })
        };

        mockClient.commands.set('guildonly', guildOnlyCommand);

        // Add a channel-specific command
        const channelCommand: BotCommand = {
            name: 'channel',
            description: 'A channel-specific command',
            usage: '',
            channel: {
                id: 'specificChannelId',
                name: 'specific-channel'
            },
            execute: jest.fn().mockResolvedValue({ success: true, message: 'Channel command executed' })
        };

        mockClient.commands.set('channel', channelCommand);

        // Add a command with aliases
        const aliasCommand: BotCommand = {
            name: 'alias',
            description: 'A command with aliases',
            usage: '',
            aliases: ['a', 'al'],
            execute: jest.fn().mockResolvedValue({ success: true, message: 'Alias command executed' })
        };

        mockClient.commands.set('alias', aliasCommand);
    });

    test('listen should ignore messages from bots', async () => {
        const msg = createMockMessage('!test', true);
        const result = await commandController.listen(msg, mockClient);

        expect(result).toBeUndefined();
    });

    test('listen should ignore messages without a prefix', async () => {
        const msg = createMockMessage('test');
        const result = await commandController.listen(msg, mockClient);

        expect(result).toBeUndefined();
    });

    test('listen should execute a command when a valid command is used', async () => {
        const msg = createMockMessage('!test');
        const result = await commandController.listen(msg, mockClient);

        expect(result).toEqual({ success: true, message: 'Test command executed' });
        expect(mockClient.commands.get('test')?.execute).toHaveBeenCalled();
    });

    test('listen should handle commands with aliases', async () => {
        const msg = createMockMessage('!a');
        const result = await commandController.listen(msg, mockClient);

        expect(result).toEqual({ success: true, message: 'Alias command executed' });
        expect(mockClient.commands.get('alias')?.execute).toHaveBeenCalled();
    });

    test('listen should return an error for guild-only commands used in DMs', async () => {
        const msg = createMockMessage('!guildonly', false, null);

        const result = await commandController.listen(msg, mockClient);

        expect(result).toEqual({
            success: false,
            message: 'This command can only be used in a server.'
        });
    });

    test('listen should return an error for channel-specific commands used in the wrong channel', async () => {
        const msg = createMockMessage('!channel', false, 'mockGuildId', 'wrongChannelId');

        const result = await commandController.listen(msg, mockClient);

        expect(result).toEqual({
            success: false,
            message: 'This command can only be used in the #specific-channel channel.'
        });
    });

    test('listen should handle non-existent commands', async () => {
        const msg = createMockMessage('!nonexistent');
        const result = await commandController.listen(msg, mockClient);

        expect(result).toBeUndefined();
    });

    test('listen should handle errors during command execution', async () => {
        const msg = createMockMessage('!test');
        const mockCommand = mockClient.commands.get('test');
        if (mockCommand) {
            mockCommand.execute = jest.fn().mockRejectedValue(new Error('Test error'));
        }

        const result = await commandController.listen(msg, mockClient);

        expect(result).toEqual({
            success: false,
            error: 'An error occurred while executing the command.'
        });
    });
}); 