#!/usr/bin/env node

/**
 * Simple script to create an admin user for Bucksy Admin
 * This version uses pure JavaScript and doesn't require TypeScript
 * 
 * Usage: node scripts/create-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Determine MongoDB connection details from environment or config
let MONGODB_URI;
let DB_NAME;

// Try to load from .env
if (process.env.MONGODB_URI) {
    MONGODB_URI = process.env.MONGODB_URI;
    DB_NAME = process.env.DB_NAME || 'bucksy';
} else {
    // Try to load from config.json
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            MONGODB_URI = config.mongoUri || 'mongodb://localhost:27017';
            DB_NAME = config.dbName || 'bucksy';
        } else {
            MONGODB_URI = 'mongodb://localhost:27017';
            DB_NAME = 'bucksy';
        }
    } catch (error) {
        console.warn('Could not read config.json, using default MongoDB settings');
        MONGODB_URI = 'mongodb://localhost:27017';
        DB_NAME = 'bucksy';
    }
}

// Promisify question
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log('=== Bucksy Admin User Creation Tool ===');

    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        console.log('Connected to MongoDB successfully!');
        const db = client.db(DB_NAME);
        const usersCollection = db.collection('users');

        // Get username from user input
        const username = await question('Enter username for the new admin user: ');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            console.error(`Error: User "${username}" already exists!`);
            await client.close();
            rl.close();
            return;
        }

        // Get password from user input
        const password = await question('Enter password for the new admin user: ');

        // Confirm password
        const confirmPassword = await question('Confirm password: ');

        // Check if passwords match
        if (password !== confirmPassword) {
            console.error('Error: Passwords do not match!');
            await client.close();
            rl.close();
            return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user object
        const user = {
            id: `admin_${Date.now()}`,
            username,
            passwordHash,
            role: 'admin',
            points: 0,
            registeredAt: new Date()
        };

        // Insert user into database
        const result = await usersCollection.insertOne(user);

        if (result.acknowledged) {
            console.log('\n✅ Admin user created successfully!');
            console.log(`Username: ${username}`);
            console.log('You can now log in to the admin interface with these credentials.');
        } else {
            console.error('Error: Failed to create admin user.');
        }

        // Close MongoDB connection
        await client.close();
        console.log('MongoDB connection closed.');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        rl.close();
    }
}

// Run the script
main(); 