import { MongoClient, MongoServerError } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function removeUniqueIndexes() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('MongoDB URI not found in environment variables');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(process.env.MONGODB_DB_NAME || 'bucksy');

        // Collections to process
        const collections = ['users', 'shinies', 'questions'];

        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            console.log(`\nProcessing collection: ${collectionName}`);

            // Get all indexes
            const indexes = await collection.indexes();
            console.log(`Found ${indexes.length} indexes`);

            // Find and drop unique indexes
            for (const index of indexes) {
                if (index.unique === true) {
                    console.log(`Dropping unique index:`, index);
                    await collection.dropIndex(index.name);
                    console.log(`Successfully dropped index: ${index.name}`);
                }
            }
        }

        console.log('\nAll unique indexes have been removed successfully');
    } catch (error) {
        console.error('Error removing indexes:', error);
        if (error instanceof MongoServerError) {
            console.error('MongoDB Error Code:', error.code);
        }
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
removeUniqueIndexes().catch(console.error); 