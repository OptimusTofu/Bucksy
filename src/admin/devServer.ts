import * as dotenv from 'dotenv';
import * as DatabaseController from '../controllers/database';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

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

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bucksy',
        ttl: 14 * 24 * 60 * 60, // 14 days
        crypto: {
            secret: process.env.SESSION_SECRET || 'your-secret-key'
        },
        autoRemove: 'native', // Default
        touchAfter: 24 * 3600 // 1 day (in seconds)
    }),
    cookie: {
        secure: isProduction,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
        sameSite: isProduction ? 'none' : 'lax',
        httpOnly: true
    }
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
    res.render('login', {
        error: null,
        isProduction: process.env.NODE_ENV === 'production'
    });
});

app.post('/login', (req: RequestWithSession, res: Response) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.authenticated = true;
        req.session.username = username;
        res.redirect('/');
    } else {
        res.render('login', {
            error: 'Invalid username or password',
            isProduction: process.env.NODE_ENV === 'production'
        });
    }
});

app.get('/logout', (req: RequestWithSession, res: Response) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Protected routes
app.get('/', isAuthenticated, (req: RequestWithSession, res: Response) => {
    res.render('dashboard', {
        username: req.session.username || 'Admin',
        isProduction: process.env.NODE_ENV === 'production'
    });
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

app.put('/api/questions/:id', isAuthenticated, async (req: RequestWithSession, res: Response) => {
    try {
        const { id } = req.params;
        const { text, used } = req.body;

        // Update the question
        const result = await DatabaseController.updateQuestion(id, { text, used });

        if (result.success) {
            res.json(result.data);
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update question' });
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

// Start the server
async function startDevServer() {
    try {
        // Initialize database connection
        const dbInitialized = await DatabaseController.initializeDB();
        if (!dbInitialized) {
            console.error("Failed to initialize database. Exiting...");
            process.exit(1);
        }

        app.listen(port, () => {
            console.log(`Admin interface running on port ${port}`);
            console.log(`Login with username: ${process.env.ADMIN_USERNAME} and password: ${process.env.ADMIN_PASSWORD}`);
            console.log(`Open http://localhost:${port} in your browser`);
        });
    } catch (error) {
        console.error("Error starting admin server:", error);
        process.exit(1);
    }
}

startDevServer(); 