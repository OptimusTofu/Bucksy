#!/usr/bin/env ts-node

import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import { initializeDB, createAdminUser, findUserByUsername } from '../controllers/database';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify question
function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log('=== Bucksy Admin User Creation Tool ===');

    try {
        // Initialize database connection
        console.log('Connecting to database...');
        const initialized = await initializeDB();

        if (!initialized) {
            console.error('Failed to initialize database connection.');
            rl.close();
            return;
        }

        console.log('Connected to database successfully!');

        // Get username from user input
        const username = await question('Enter username for the new admin user: ');

        // Check if user already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            console.error(`Error: User "${username}" already exists!`);
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
            rl.close();
            return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create admin user
        const result = await createAdminUser(username, passwordHash);

        if (result.success) {
            console.log('\n✅ Admin user created successfully!');
            console.log(`Username: ${username}`);
            console.log('You can now log in to the admin interface with these credentials.');
        } else {
            console.error(`Error: ${result.error || 'Failed to create admin user.'}`);
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        rl.close();
        // Exit process explicitly to ensure it terminates
        process.exit(0);
    }
}

// Run the script
main(); 