#!/usr/bin/env node

// Script to create a new admin user for the Bucksy Admin interface
// Run with: node scripts/create-admin-user.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Get MongoDB connection string from environment variable or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bucksy';

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
        const username = await new Promise(resolve => {
            rl.question('Enter username for the new admin user: ', answer => {
                resolve(answer.trim());
            });
        });

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            console.error(`Error: User "${username}" already exists!`);
            await client.close();
            rl.close();
            return;
        }

        // Get password from user input
        const password = await new Promise(resolve => {
            rl.question('Enter password for the new admin user: ', answer => {
                resolve(answer.trim());
            });
        });

        // Confirm password
        const confirmPassword = await new Promise(resolve => {
            rl.question('Confirm password: ', answer => {
                resolve(answer.trim());
            });
        });

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