#!/usr/bin/env node

/**
 * Script to check session configuration and MongoDB connection
 * This helps troubleshoot session-related login issues
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

// Load MongoDB connection info
let mongoUri = process.env.MONGODB_URI;
let dbName;

if (!mongoUri) {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            mongoUri = config.mongoDBURL || 'mongodb://localhost:27017/bucksy';
            dbName = config.mongoDBName || 'bucksy';
        } else {
            mongoUri = 'mongodb://localhost:27017/bucksy';
            dbName = 'bucksy';
        }
    } catch (error) {
        console.error('Error reading config:', error);
        mongoUri = 'mongodb://localhost:27017/bucksy';
        dbName = 'bucksy';
    }
}

// Extract the database name from the URI if not already set
if (!dbName) {
    const uriParts = mongoUri.split('/');
    if (uriParts.length > 3) {
        dbName = uriParts[3].split('?')[0];
    } else {
        dbName = 'bucksy';
    }
}

console.log(`MongoDB URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
console.log(`Database Name: ${dbName}`);

// Check for session store collection
async function checkSessionCollection() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        const sessionCollName = 'sessions';
        const hasSessionCollection = collections.some(coll => coll.name === sessionCollName);

        if (hasSessionCollection) {
            console.log(`✅ Session collection '${sessionCollName}' exists`);

            // Count the sessions
            const sessionCount = await db.collection(sessionCollName).countDocuments();
            console.log(`   Found ${sessionCount} session(s) in the database`);

            // Show sample session if any exist
            if (sessionCount > 0) {
                const sampleSession = await db.collection(sessionCollName).findOne({});
                console.log('   Sample session:');
                console.log(`   - ID: ${sampleSession._id}`);
                console.log(`   - Expires: ${new Date(sampleSession.expires).toLocaleString()}`);
                console.log(`   - Created: ${sampleSession.createdAt ? new Date(sampleSession.createdAt).toLocaleString() : 'unknown'}`);
            }
        } else {
            console.log(`❌ Session collection '${sessionCollName}' does not exist yet`);
            console.log('   This is normal if no sessions have been created yet');
            console.log('   The collection will be created automatically when a user logs in');
        }

        // Check users collection
        const usersCollName = 'users';
        const hasUsersCollection = collections.some(coll => coll.name === usersCollName);

        if (hasUsersCollection) {
            console.log(`✅ Users collection '${usersCollName}' exists`);

            // Count admin users
            const adminCount = await db.collection(usersCollName).countDocuments({ role: 'admin' });
            console.log(`   Found ${adminCount} admin user(s) in the database`);

            if (adminCount === 0) {
                console.log('❌ No admin users found! You need to create an admin user.');
                console.log('   Run: npm run create:admin');
            }
        } else {
            console.log(`❌ Users collection '${usersCollName}' does not exist`);
            console.log('   This is a problem - your database may not be properly initialized');
        }

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Check express-session configuration
function checkSessionConfig() {
    console.log('\nExpress Session Configuration:');

    // Secret check
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
        console.log('⚠️  SESSION_SECRET not set in environment variables');
        console.log('   Using default value, which is not secure for production');
    } else {
        console.log('✅ SESSION_SECRET is set');
    }

    // Cookie settings for production
    if (isProduction) {
        console.log('\nProduction Cookie Settings:');
        console.log('✅ secure: true - Cookies will only be sent over HTTPS');
        console.log('✅ sameSite: none - Allows cross-site cookies with HTTPS');
        console.log('✅ httpOnly: true - Prevents JavaScript access to cookies');

        console.log('\nNginx Configuration:');
        console.log('✅ proxy_cookie_path configured for secure cookies');
        console.log('✅ X-Forwarded-Proto header set to pass HTTPS status');
    }
}

// Run checks
async function runChecks() {
    console.log('=== Bucksy Admin Session Configuration Check ===\n');

    // Check session config
    checkSessionConfig();

    // Check MongoDB and session collection
    console.log('\nChecking MongoDB connection and session storage:');
    await checkSessionCollection();

    console.log('\n=== Session Check Complete ===');
    console.log('\nIf you are still having issues with login:');
    console.log('1. Make sure NODE_ENV=production is set on your server');
    console.log('2. Ensure Nginx is correctly configured to proxy HTTPS requests');
    console.log('3. Try clearing browser cookies and cache');
    console.log('4. Create a new admin user with: npm run create:admin');
}

runChecks().catch(console.error); 