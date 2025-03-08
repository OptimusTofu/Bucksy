import { Message } from 'discord.js';
import balanceCommand from '../../../commands/games/balance';
import * as DatabaseController from '../../../controllers/database';

// Mock the DatabaseController
jest.mock('../../../controllers/database', () => ({
    userExists: jest.fn(),
    getBalance: jest.fn()
}));

// Mock the Message object
const createMockMessage = (userId = 'mockUserId') => {
    return {
        member: {
            user: {
                id: userId
            }
        },
        reply: jest.fn().mockResolvedValue({})
    } as unknown as Message;
};

describe('Balance Command', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return an error if user ID cannot be determined', async () => {
        const msg = {} as Message;
        const result = await balanceCommand.execute(msg);

        expect(result).toEqual({
            success: false,
            message: 'Could not determine your user ID. Please try again.'
        });
    });

    test('should return an error if user is not registered', async () => {
        const msg = createMockMessage();
        (DatabaseController.userExists as jest.Mock).mockResolvedValue(false);

        const result = await balanceCommand.execute(msg);

        expect(result).toEqual({
            success: false,
            message: 'User not registered'
        });
        expect(msg.reply).toHaveBeenCalledWith('You need to register to the points registry first. Please type "!register"');
    });

    test('should return an error if balance retrieval fails', async () => {
        const msg = createMockMessage();
        (DatabaseController.userExists as jest.Mock).mockResolvedValue(true);
        (DatabaseController.getBalance as jest.Mock).mockResolvedValue(null);

        const result = await balanceCommand.execute(msg);

        expect(result).toEqual({
            success: false,
            message: 'Error retrieving balance'
        });
        expect(msg.reply).toHaveBeenCalledWith('There was an error retrieving your balance. Please try again later.');
    });

    test('should return the user\'s balance if successful', async () => {
        const msg = createMockMessage();
        (DatabaseController.userExists as jest.Mock).mockResolvedValue(true);
        (DatabaseController.getBalance as jest.Mock).mockResolvedValue(500);

        const result = await balanceCommand.execute(msg);

        expect(result).toEqual({
            success: true,
            message: 'Balance: 500'
        });
        expect(msg.reply).toHaveBeenCalledWith(expect.stringContaining('500'));
    });

    test('should handle errors during execution', async () => {
        const msg = createMockMessage();
        (DatabaseController.userExists as jest.Mock).mockRejectedValue(new Error('Test error'));

        const result = await balanceCommand.execute(msg);

        expect(result).toEqual({
            success: false,
            error: 'An error occurred while processing your request. Please try again later.'
        });
    });
}); 