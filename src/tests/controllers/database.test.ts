import * as DatabaseController from '../../controllers/database';

// Mock the MongoDB client
jest.mock('mongodb', () => {
    const mockCollection = {
        createIndex: jest.fn().mockResolvedValue(true),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockId' }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        findOne: jest.fn().mockImplementation((query) => {
            if (query.id === 'existingUser') {
                return Promise.resolve({ id: 'existingUser', points: 500 });
            }
            return Promise.resolve(null);
        }),
        find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
                { title: 'Pikachu' },
                { title: 'Charizard' },
                { title: 'Bulbasaur' }
            ])
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
    };

    const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection)
    };

    return {
        MongoClient: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(true),
            db: jest.fn().mockReturnValue(mockDb),
            close: jest.fn().mockResolvedValue(true)
        }))
    };
});

describe('Database Controller', () => {
    beforeAll(async () => {
        // Initialize the database
        await DatabaseController.initializeDB();
    });

    describe('User Operations', () => {
        test('addUser should add a user to the database', async () => {
            const result = await DatabaseController.addUser('newUser');
            expect(result).toBe(true);
        });

        test('userExists should return true for existing users', async () => {
            const result = await DatabaseController.userExists('existingUser');
            expect(result).toBe(true);
        });

        test('userExists should return false for non-existing users', async () => {
            const result = await DatabaseController.userExists('nonExistingUser');
            expect(result).toBe(false);
        });

        test('getBalance should return the user\'s balance', async () => {
            const result = await DatabaseController.getBalance('existingUser');
            expect(result).toBe(500);
        });

        test('getBalance should return null for non-existing users', async () => {
            const result = await DatabaseController.getBalance('nonExistingUser');
            expect(result).toBeNull();
        });

        test('updateBalance should update the user\'s balance', async () => {
            const result = await DatabaseController.updateBalance('existingUser', 100);
            expect(result).toBe(true);
        });
    });

    describe('Shiny Operations', () => {
        test('addShiny should add a shiny Pokemon to the database', async () => {
            const result = await DatabaseController.addShiny('Pikachu');
            expect(result.success).toBe(true);
        });

        test('shinyExists should return true for existing shinies', async () => {
            const mockCollection = require('mongodb').MongoClient().db().collection();
            mockCollection.findOne.mockResolvedValueOnce({ title: 'Pikachu' });

            const result = await DatabaseController.shinyExists('Pikachu');
            expect(result).toBe(true);
        });

        test('shinyExists should return false for non-existing shinies', async () => {
            const mockCollection = require('mongodb').MongoClient().db().collection();
            mockCollection.findOne.mockResolvedValueOnce(null);

            const result = await DatabaseController.shinyExists('MissingNo');
            expect(result).toBe(false);
        });

        test('getShinies should return a list of shinies', async () => {
            const result = await DatabaseController.getShinies();
            expect(result).toBe('Pikachu, Charizard, Bulbasaur');
        });

        test('removeShiny should remove a shiny Pokemon from the database', async () => {
            const result = await DatabaseController.removeShiny('Pikachu');
            expect(result.success).toBe(true);
        });
    });

    describe('Question Operations', () => {
        test('addQuestion should add a question to the database', async () => {
            const result = await DatabaseController.addQuestion('What is your favorite Pokemon?');
            expect(result.success).toBe(true);
        });

        test('questionExists should return true for existing questions', async () => {
            const mockCollection = require('mongodb').MongoClient().db().collection();
            mockCollection.findOne.mockResolvedValueOnce({ text: 'What is your favorite Pokemon?' });

            const result = await DatabaseController.questionExists('What is your favorite Pokemon?');
            expect(result).toBe(true);
        });

        test('questionExists should return false for non-existing questions', async () => {
            const mockCollection = require('mongodb').MongoClient().db().collection();
            mockCollection.findOne.mockResolvedValueOnce(null);

            const result = await DatabaseController.questionExists('What is the meaning of life?');
            expect(result).toBe(false);
        });
    });
}); 