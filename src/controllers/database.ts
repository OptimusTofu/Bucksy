import { MongoClient, Collection, Db, MongoServerError } from 'mongodb';
import * as config from '../../config.json';
import * as dotenv from 'dotenv';
import {
    User,
    Shiny,
    Question,
    DatabaseCollections,
    InsertResult,
    UpdateOperationResult,
    DeleteOperationResult,
    UserResult,
    ShinyResult,
    QuestionResult,
    DatabaseResult
} from '../types/database';
import { ObjectId } from 'mongodb';

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables or fallback to config
const uri = process.env.MONGODB_URI || config.mongoDBURL;

// Create a MongoDB client with connection pooling
const client = new MongoClient(uri, {
    // Maximum number of connections in the pool
    maxPoolSize: 10,
    // Minimum number of connections in the pool
    minPoolSize: 1,
    // Server selection timeout
    serverSelectionTimeoutMS: 5000,
    // Socket timeout
    socketTimeoutMS: 45000,
    // Connection timeout
    connectTimeoutMS: 10000,
});

// Database and collections references
let db: Db;
let collections: DatabaseCollections;

// Initialize the database connection
export async function initializeDB(): Promise<boolean> {
    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB");

        // Get database name from URI or config
        const dbName = process.env.MONGODB_URI ?
            process.env.MONGODB_URI.split('/').pop()?.split('?')[0] :
            config.mongoDBName;

        // Get database and collections
        db = client.db(dbName);

        // Test the connection with a simple command
        await db.command({ ping: 1 });
        console.log("Database connection verified");

        collections = {
            users: db.collection<User>("users"),
            shinies: db.collection<Shiny>("shinies"),
            questions: db.collection<Question>("questions")
        };

        // Create indexes
        try {
            await collections.users.createIndex({ user_id: 1 }, { unique: true });
            await collections.shinies.createIndex({ pokemon: 1 }, { unique: true });
            await collections.questions.createIndex({ text: 1 }, { unique: true });
        } catch (error) {
            if (error instanceof MongoServerError) {
                if (error.code === 13) { // Permission denied
                    console.warn("Warning: Could not create indexes due to permission issues. This may affect performance but is not critical.");
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

        return true;
    } catch (error) {
        if (error instanceof MongoServerError) {
            if (error.code === 18) { // Authentication failed
                console.error("Failed to connect to MongoDB: Authentication failed. Please check your username and password.");
            } else if (error.code === 13) { // Permission denied
                console.error("Failed to connect to MongoDB: Permission denied. Please check your user permissions.");
            } else {
                console.error("Failed to connect to MongoDB:", error.message);
            }
        } else {
            console.error("Failed to connect to MongoDB:", error);
        }
        return false;
    }
}

// Handle application shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during MongoDB connection closure:', error);
        process.exit(1);
    }
});

// User operations
export async function addUser(user_id: string): Promise<boolean> {
    try {
        const obj: User = {
            id: user_id,
            points: config.startingPoints,
            registeredAt: new Date()
        };
        await collections.users.insertOne(obj);
        return true;
    } catch (error) {
        console.error("Error adding user:", error);
        return false;
    }
}

export async function updateBalance(user_id: string, score: number): Promise<boolean> {
    try {
        const filter = { id: user_id };
        const updatePoints = {
            $inc: { points: score },
            $set: { lastActive: new Date() }
        };
        const result = await collections.users.updateOne(filter, updatePoints);
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating balance:", error);
        return false;
    }
}

export async function getBalance(user_id: string): Promise<number | null> {
    try {
        const query = { id: user_id };
        const result = await collections.users.findOne<User>(query);
        return result ? result.points : null;
    } catch (error) {
        console.error("Error getting balance:", error);
        return null;
    }
}

export async function userExists(user_id: string): Promise<boolean> {
    try {
        const query = { id: user_id };
        const result = await collections.users.findOne<User>(query);
        return !!result;
    } catch (error) {
        console.error("Error checking if user exists:", error);
        return false;
    }
}

/**
 * Find a user by username
 * @param username The username to search for
 * @returns The user object or null if not found
 */
export async function findUserByUsername(username: string): Promise<User | null> {
    try {
        const query = { username: username };
        const result = await collections.users.findOne<User>(query);
        return result;
    } catch (error) {
        console.error("Error finding user by username:", error);
        return null;
    }
}

/**
 * Check if a user has admin role
 * @param user_id The user ID to check
 * @returns True if the user has admin role, false otherwise
 */
export async function isAdmin(user_id: string): Promise<boolean> {
    try {
        const query = { id: user_id, role: 'admin' };
        const result = await collections.users.findOne<User>(query);
        return !!result;
    } catch (error) {
        console.error("Error checking if user is admin:", error);
        return false;
    }
}

/**
 * Create an admin user
 * @param username The admin username
 * @param passwordHash The hashed password
 * @param user_id Optional user ID (Discord ID)
 * @returns Result of the operation
 */
export async function createAdminUser(username: string, passwordHash: string, user_id?: string): Promise<UserResult> {
    try {
        const obj: User = {
            id: user_id || `admin_${Date.now()}`,
            username,
            passwordHash,
            role: 'admin',
            points: 0,
            registeredAt: new Date()
        };
        const result = await collections.users.insertOne(obj);
        return {
            success: true,
            data: obj
        };
    } catch (error) {
        console.error("Error creating admin user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Update user password
 * @param username The username
 * @param passwordHash The new password hash
 * @returns True if successful, false otherwise
 */
export async function updateUserPassword(username: string, passwordHash: string): Promise<boolean> {
    try {
        const filter = { username };
        const update = {
            $set: { passwordHash, lastActive: new Date() }
        };
        const result = await collections.users.updateOne(filter, update);
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating user password:", error);
        return false;
    }
}

// Shiny operations
export async function addShiny(pokemon: string, addedBy?: string): Promise<ShinyResult> {
    try {
        const obj: Shiny = {
            title: pokemon,
            addedAt: new Date(),
            addedBy
        };
        const result = await collections.shinies.insertOne(obj);
        return {
            success: true,
            data: obj
        };
    } catch (error) {
        console.error("Error adding shiny:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function removeShiny(pokemon: string): Promise<DeleteOperationResult> {
    try {
        const query = { title: pokemon };
        const result = await collections.shinies.deleteOne(query);
        return {
            success: result.deletedCount > 0,
            data: result
        };
    } catch (error) {
        console.error("Error removing shiny:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function shinyExists(pokemon: string): Promise<boolean> {
    try {
        const query = { title: pokemon };
        const result = await collections.shinies.findOne<Shiny>(query);
        return !!result;
    } catch (error) {
        console.error("Error checking if shiny exists:", error);
        return false;
    }
}

export async function getShinies(): Promise<string> {
    try {
        const result = await collections.shinies.find<Shiny>({}).toArray();
        const filtered_result = result.map((data) => data.title).join(", ");
        return filtered_result;
    } catch (error) {
        console.error("Error getting shinies:", error);
        return "";
    }
}

// Question operations
export async function addQuestion(question: string): Promise<QuestionResult> {
    try {
        // Get the highest priority number to set new question as lowest priority
        const highestPriorityQuestion = await collections.questions.find<Question>({})
            .sort({ priority: -1 })
            .limit(1)
            .toArray();

        const nextPriority = highestPriorityQuestion.length > 0 &&
            highestPriorityQuestion[0].priority !== undefined ?
            highestPriorityQuestion[0].priority + 1 : 0;

        const obj: Question = {
            text: question,
            addedAt: new Date(),
            used: false,
            priority: nextPriority
        };
        await collections.questions.insertOne(obj);
        return {
            success: true,
            data: obj
        };
    } catch (error) {
        console.error("Error adding question:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function questionExists(question: string): Promise<boolean> {
    try {
        const query = { text: question };
        const result = await collections.questions.findOne<Question>(query);
        return !!result;
    } catch (error) {
        console.error("Error checking if question exists:", error);
        return false;
    }
}

export async function getAllQuestions(): Promise<Question[]> {
    try {
        const questions = await collections.questions.find<Question>({}).toArray();
        return questions;
    } catch (error) {
        console.error("Error fetching all questions:", error);
        throw error;
    }
}

export async function deleteQuestion(id: string): Promise<DatabaseResult<{ deletedCount: number }>> {
    try {
        const result = await collections.questions.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return {
                success: false,
                error: 'Question not found'
            };
        }
        return {
            success: true,
            data: { deletedCount: result.deletedCount }
        };
    } catch (error) {
        console.error("Error deleting question:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function updateQuestion(id: string, updates: { text?: string; used?: boolean; priority?: number }): Promise<DatabaseResult<Question>> {
    try {
        const updateData: any = {};

        if (updates.text !== undefined) {
            updateData.text = updates.text;
        }

        if (updates.used !== undefined) {
            updateData.used = updates.used;
            if (updates.used) {
                updateData.usedAt = new Date();
            }
        }

        if (updates.priority !== undefined) {
            updateData.priority = updates.priority;
        }

        const result = await collections.questions.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return {
                success: false,
                error: 'Question not found'
            };
        }

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error("Error updating question:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Update the priorities of multiple questions at once
 * @param priorityUpdates Array of objects with question ID and new priority
 * @returns Success status and any errors
 */
export async function updateQuestionPriorities(
    priorityUpdates: Array<{ id: string; priority: number }>
): Promise<DatabaseResult<{ updatedCount: number }>> {
    try {
        let updatedCount = 0;

        // Use a transaction or bulk operation if available
        const bulkOps = priorityUpdates.map(update => ({
            updateOne: {
                filter: { _id: new ObjectId(update.id) },
                update: { $set: { priority: update.priority } }
            }
        }));

        if (bulkOps.length > 0) {
            const result = await collections.questions.bulkWrite(bulkOps);
            updatedCount = result.modifiedCount;
        }

        return {
            success: true,
            data: { updatedCount }
        };
    } catch (error) {
        console.error("Error updating question priorities:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get the next question to use based on priority
 * @returns The next question to use or null if none available
 */
export async function getNextQuestionByPriority(): Promise<Question | null> {
    try {
        // Get the unused question with the lowest priority number (highest priority)
        const nextQuestion = await collections.questions.find<Question>({ used: false })
            .sort({ priority: 1 })
            .limit(1)
            .toArray();

        return nextQuestion.length > 0 ? nextQuestion[0] : null;
    } catch (error) {
        console.error("Error getting next question by priority:", error);
        return null;
    }
} 