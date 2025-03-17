import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { BucksyClient } from '../types';
import * as DatabaseController from '../controllers/database';
import fs from 'fs';

// Extend Express Request type to include session
interface RequestWithSession extends Request {
    session: session.Session & {
        authenticated?: boolean;
        userId?: string;
        username?: string;
    };
}

const app = express();
const port = process.env.ADMIN_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const isAuthenticated = (req: RequestWithSession, res: Response, next: NextFunction) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/login', (req: RequestWithSession, res: Response) => {
    res.render('login', { error: null });
});

app.post('/login', async (req: RequestWithSession, res: Response) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await DatabaseController.findUserByUsername(username);

        // Check if user exists and has admin role
        if (!user || user.role !== 'admin' || !user.passwordHash) {
            res.render('login', { error: 'Invalid username or password' });
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordMatch) {
            // Set session variables
            req.session.authenticated = true;
            req.session.userId = user.id;
            req.session.username = user.username;

            // Redirect to dashboard
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
});

app.get('/logout', (req: RequestWithSession, res: Response) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Protected routes
app.get('/', isAuthenticated, (req: RequestWithSession, res: Response) => {
    res.render('dashboard', { username: req.session.username });
});

// Admin user management API
app.post('/api/admin/users', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { username, password, userId } = req.body;

        // Check if user already exists
        const existingUser = await DatabaseController.findUserByUsername(username);
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create admin user
        const result = await DatabaseController.createAdminUser(username, passwordHash, userId);

        if (result.success) {
            res.json({ message: 'Admin user created successfully' });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

app.put('/api/admin/users/password', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const username = req.session.username;

        if (!username) {
            res.status(400).json({ error: 'User not authenticated' });
            return;
        }

        // Get current user
        const user = await DatabaseController.findUserByUsername(username);
        if (!user || !user.passwordHash) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const updated = await DatabaseController.updateUserPassword(username, passwordHash);

        if (updated) {
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ error: 'Failed to update password' });
        }
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Questions API
app.get('/api/questions', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const questions = await DatabaseController.getAllQuestions();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

app.post('/api/questions', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { text } = req.body;
        const result = await DatabaseController.addQuestion(text);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add question' });
    }
});

app.delete('/api/questions/:id', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { id } = req.params;
        const result = await DatabaseController.deleteQuestion(id);
        if (result.success) {
            res.json({ message: 'Question deleted' });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

app.put('/api/questions/:id', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { id } = req.params;
        const { text, used, priority } = req.body;
        const result = await DatabaseController.updateQuestion(id, { text, used, priority });
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update question' });
    }
});

app.post('/api/questions/priorities', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { priorities } = req.body;

        if (!Array.isArray(priorities)) {
            res.status(400).json({ error: 'Priorities must be an array' });
            return;
        }

        const result = await DatabaseController.updateQuestionPriorities(priorities);

        if (result.success) {
            res.json({ message: 'Priorities updated successfully', updatedCount: result.data?.updatedCount });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error updating priorities:', error);
        res.status(500).json({ error: 'Failed to update priorities' });
    }
});

// Settings API
app.get('/api/settings', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        // Read settings from config file
        const configPath = path.join(__dirname, '../../config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);

        // Extract QOTD settings
        const settings = {
            qotdTime: config.qotdTime || '0 0 8 * * *', // Default to 8 AM
            qotdTimezone: config.qotdTimezone || 'America/New_York'
        };

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { qotdTime, qotdTimezone } = req.body;

        // Read current config
        const configPath = path.join(__dirname, '../../config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);

        // Convert time input (HH:MM) to cron format (0 MM HH * * *)
        let cronTime = config.qotdTime;
        if (qotdTime) {
            const [hours, minutes] = qotdTime.split(':');
            cronTime = `0 ${minutes} ${hours} * * *`;
        }

        // Update config
        config.qotdTime = cronTime;
        if (qotdTimezone) {
            config.qotdTimezone = qotdTimezone;
        }

        // Write updated config back to file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Create default admin user on startup if none exists
async function ensureAdminUser() {
    try {
        // Check if any admin user exists
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const existingAdmin = await DatabaseController.findUserByUsername(adminUsername);

        if (!existingAdmin) {
            // Create default admin user
            const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

            await DatabaseController.createAdminUser(adminUsername, passwordHash);
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error ensuring admin user exists:', error);
    }
}

export const startAdminServer = async (client: BucksyClient) => {
    // Ensure admin user exists
    await ensureAdminUser();

    app.listen(port, () => {
        console.log(`Admin interface running on port ${port}`);
    });
}; 