import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config();

async function fixDatabaseIndex() {
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
        const questions = db.collection('questions');

        // Step 1: Check if the problematic index exists
        const indexes = await questions.indexes();
        const questionIndex = indexes.find(index =>
            index.key && index.key.question === 1 && index.unique === true
        );

        if (questionIndex) {
            console.log('Found problematic index:', questionIndex.name);

            // Step 2: Drop the problematic index
            if (questionIndex.name) {
                await questions.dropIndex(questionIndex.name);
                console.log('Dropped the problematic index');
            } else {
                console.log('Could not drop index: name is undefined');
            }
        } else {
            console.log('Problematic index not found');
        }

        // Step 3: Find and fix documents with null question field
        const nullQuestions = await questions.find({ question: null }).toArray();
        console.log(`Found ${nullQuestions.length} documents with null question field`);

        if (nullQuestions.length > 0) {
            // Option 1: Delete the documents
            const deleteResult = await questions.deleteMany({ question: null });
            console.log(`Deleted ${deleteResult.deletedCount} documents with null question field`);

            // Option 2 (alternative): Update the documents if they have text field
            // Uncomment this if you want to update instead of delete
            /*
            for (const doc of nullQuestions) {
              if (doc.text) {
                await questions.updateOne(
                  { _id: doc._id },
                  { $unset: { question: "" } }
                );
                console.log(`Updated document ${doc._id}`);
              }
            }
            */
        }

        // Step 4: Create the correct index
        await questions.createIndex({ text: 1 }, { unique: true });
        console.log('Created new index on text field');

        console.log('Database index fixed successfully');
    } catch (error) {
        console.error('Error fixing database index:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

fixDatabaseIndex().catch(console.error); 