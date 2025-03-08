import { MongoClient, Collection, Db } from 'mongodb';
import * as config from '../../config.json';
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
    QuestionResult
} from '../types/database';

const uri = config.mongoDBURL;

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

        // Get database and collections
        db = client.db(config.mongoDBName);
        collections = {
            users: db.collection<User>("users"),
            shinies: db.collection<Shiny>("shinies"),
            questions: db.collection<Question>("questions")
        };

        // Create indexes if needed
        await collections.users.createIndex({ id: 1 }, { unique: true });
        await collections.shinies.createIndex({ title: 1 }, { unique: true });

        return true;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
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
        const obj: Question = {
            text: question,
            addedAt: new Date(),
            used: false
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