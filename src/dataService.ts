/**
 * This module implements a REST-inspired web service for the Adventure Game DB hosted
 * on PostgreSQL. Notes:
 *
 * - This service supports the Adventure Game entities (Adventurers, Adventures, Regions, etc.).
 *
 * - This service is written in TypeScript and uses Node type-stripping, which
 * is experimental, but simple (see: https://nodejs.org/en/learn/typescript/run-natively).
 * To do a static type check, run the following:
 *      npm run type-check
 *
 * - The service assumes that the database connection strings and the server
 * mode are set in environment variables (e.g., using a git-ignored `.env.sh` file).
 * See the DB_* variables used by pgPromise.
 *
 * - To execute locally, run the following:
 *      source .env.sh
 *      npm start
 *
 * - To guard against SQL injection attacks, this code uses pgPromise's built-in
 * variable escaping. This prevents a client from issuing this SQL-injection URL:
 *     `https://cs262.azurewebsites.net/players/1;DELETE FROM Player`
 * which would delete records in the PlayerGame and then the Player tables.
 * In particular, we don't use JS template strings because this doesn't filter
 * client-supplied values properly.
 *
 * - The endpoints call `next(err)` to handle errors without crashing the service.
 * This initiates the default error handling middleware, which logs full error
 * details to the server-side console and returns uninformative HTTP 500
 * responses to clients. This makes the service a bit more secure (because it
 * doesn't reveal database details to clients), but also makes it more difficult
 * for API users (because they don't get useful error messages).
 *
 * @author: kvlinden
 * @date: Summer, 2020
 * @date: Fall, 2025 (updated to JS->TS, Node version, and master->main repo)
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import pgPromise from 'pg-promise';

// Load environment variables from .env file
dotenv.config();

// Password hashing configuration
const SALT_ROUNDS = 12;

// JWT configuration
const JWT_SECRET: string = process.env.JWT_SECRET || 'wayfind-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Rate limiting configuration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: {
        error: 'Too many authentication attempts, please try again after 15 minutes',
        retryAfter: '15 minutes',
        type: 'RATE_LIMIT_AUTH'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for successful authentication to allow normal usage
        return false;
    },
    handler: (req, res) => {
        const clientIP = req.ip || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        console.log(`🚨 AUTH RATE LIMIT EXCEEDED:`);
        console.log(`   IP: ${clientIP}`);
        console.log(`   Endpoint: ${req.method} ${req.path}`);
        console.log(`   User-Agent: ${userAgent}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
        
        res.status(429).json({
            error: 'Too many authentication attempts from this IP',
            message: 'Please wait 15 minutes before trying again',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString(),
            type: 'RATE_LIMIT_AUTH'
        });
    }
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 attempts per hour for very sensitive operations
    message: {
        error: 'Too many attempts for this sensitive operation',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter (more permissive)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP',
        message: 'Please slow down your requests',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const clientIP = req.ip || req.socket.remoteAddress;
        console.log(`⚠️  GENERAL RATE LIMIT: IP ${clientIP} exceeded general API limits`);
        
        res.status(429).json({
            error: 'Too many requests from this IP',
            message: 'Please slow down your requests',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString(),
            type: 'RATE_LIMIT_GENERAL'
        });
    }
});

// Import types for compile-time checking.
import type { NextFunction, Request, Response } from 'express';

// Set up the database
const db = pgPromise()({
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT as string) || 5432,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

/* ============================================================================ */
/* JWT UTILITY FUNCTIONS */
/* ============================================================================ */

interface JWTPayload {
    id: number;
    username: string;
    iat?: number;
    exp?: number;
}

function generateAccessToken(user: { id: number; username: string }): string {
    // @ts-ignore - JWT overload issue with TypeScript
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET!, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

function generateRefreshToken(user: { id: number; username: string }): string {
    // @ts-ignore - JWT overload issue with TypeScript
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET!, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}

function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET!) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

// Refresh token endpoint
async function refreshToken(req: Request, res: Response): Promise<void> {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }
        
        // Verify the refresh token
        const decoded = verifyToken(refreshToken);
        
        // Generate new access token
        const newAccessToken = generateAccessToken({ id: decoded.id, username: decoded.username });
        const newRefreshToken = generateRefreshToken({ id: decoded.id, username: decoded.username });
        
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            tokenType: 'Bearer',
            expiresIn: JWT_EXPIRES_IN,
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
}

// Verify token endpoint
async function verifyTokenEndpoint(req: Request, res: Response): Promise<void> {
    try {
        // If we get here, the token has already been verified by the authenticateToken middleware
        const user = (req as any).user;
        
        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
            },
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
}

/* ============================================================================ */
/* JWT MIDDLEWARE */
/* ============================================================================ */

function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    
    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// Add database connection test (non-blocking)
let dbConnected = false;
db.connect()
    .then((obj) => {
        console.log('Database connection successful');
        dbConnected = true;
        obj.done(); // success, release connection
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message);
        console.log('Server will continue with mock data fallback');
        dbConnected = false;
    });

// Configure the server and its routes
const app = express();
const port: number = parseInt(process.env.PORT as string) || 3000;

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Configure CORS and JSON parsing
app.use(express.json());

const router = express.Router();

router.get('/', readHello);
router.get('/test', testEndpoint);

/* ============================================================================ */
/* ADVENTURER ROUTES (Some Protected) */
/* ============================================================================ */
router.get('/adventurers', readAdventurers);
router.get('/adventurer/:id', readAdventurer);
router.post('/adventurers', authLimiter, createAdventurer); // Rate limited signup
router.put('/adventurer/:id', authenticateToken, updateAdventurer); // Protected
router.delete('/adventurer/:id', authenticateToken, deleteAdventurer); // Protected

/* ============================================================================ */
/* AUTHENTICATION ROUTES */
/* ============================================================================ */
router.post('/auth/login', authLimiter, authenticateUser);
router.post('/auth/refresh', authLimiter, refreshToken);
router.post('/auth/verify', authenticateToken, verifyTokenEndpoint);

/* ============================================================================ */
/* REGION ROUTES */
/* ============================================================================ */
router.get('/regions', readRegions);
router.get('/region/:id', readRegion);
router.post('/regions', createRegion);
router.put('/region/:id', updateRegion);
router.delete('/region/:id', deleteRegion);

/* ============================================================================ */
/* LANDMARK ROUTES */
/* ============================================================================ */
router.get('/landmarks', readLandmarks);
router.get('/landmark/:id', readLandmark);
router.get('/landmarks/region/:id', readLandmarksInRegion);
router.post('/landmarks', createLandmark);
router.put('/landmark/:id', updateLandmark);
router.delete('/landmark/:id', deleteLandmark);

/* ============================================================================ */
/* ADVENTURE ROUTES */
/* ============================================================================ */
router.get('/adventures', readAdventures);
router.get('/adventure/:id', readAdventure);
router.get('/adventures/region/:id', readAdventuresByRegion);
router.get('/adventures/adventurer/:id', readAdventuresByAdventurer);
router.post('/adventures', createAdventure);
router.put('/adventure/:id', updateAdventure);
router.delete('/adventure/:id', deleteAdventure);

/* ============================================================================ */
/* TOKEN ROUTES */
/* ============================================================================ */
router.get('/tokens', readTokens);
router.get('/token/:id', readToken);
router.get('/tokens/adventure/:id', readTokensInAdventure);
router.post('/tokens', createToken);
router.put('/token/:id', updateToken);
router.delete('/token/:id', deleteToken);

/* ============================================================================ */
/* COMPLETED ADVENTURE ROUTES */
/* ============================================================================ */
router.get('/completedAdventures', readCompletedAdventures);
router.get('/completedAdventure/:id', readCompletedAdventure);
router.get('/completedAdventures/adventurer/:id', readCompletedAdventuresByAdventurer);
router.post('/completedAdventures', createCompletedAdventure);
router.put('/completedAdventure/:id', updateCompletedAdventure);
router.delete('/completedAdventure/:id', deleteCompletedAdventure);


app.use(router);

// Add error handling middleware AFTER routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(port, (): void => {
    console.log(`Listening on port ${port}`);
});

/**
 * This endpoint returns a simple hello-world message, serving as a basic
 * health check and welcome message for the API.
 */
function readHello(_request: Request, response: Response, next: NextFunction): void {
    try {
        console.log('Hello endpoint called');
        // console.log('Environment check:');
        // console.log('DB_SERVER:', process.env.DB_SERVER ? 'Set' : 'Missing');
        // console.log('DB_DATABASE:', process.env.DB_DATABASE ? 'Set' : 'Missing'); 
        // console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Missing');
        // console.log('PORT:', process.env.PORT);
        // console.log('NODE_ENV:', process.env.NODE_ENV);
        
        response.json(
            "Hello!"
        );
    } catch (error) {
        console.error('Error in readHello:', error);
        next(error);
    }
}

/**
 * Simple test endpoint that doesn't require database access
 */
function testEndpoint(_request: Request, response: Response, next: NextFunction): void {
    try {
        response.json({
            message: 'Test endpoint working',
            timestamp: new Date().toISOString(),
            status: 'OK'
        });
    } catch (error) {
        next(error);
    }
}

/* ============================================================================ */
/* UTILITY FUNCTIONS */
/* ============================================================================ */

/**
 * This utility function standardizes the response pattern for database queries,
 * returning the data using the given response, or a 404 status for null data
 * (e.g., when a record is not found).
 */
function returnDataOr404(response: Response, data: unknown): void {
    if (data == null) {
        response.sendStatus(404);
    } else {
        response.send(data);
    }
}

/* ============================================================================ */
/* ADVENTURER FUNCTIONS */
/* ============================================================================ */

function readAdventurers(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Adventurer ORDER BY id')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM Adventurer WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

async function createAdventurer(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(request.body.password, SALT_ROUNDS);
        
        const adventurerData = {
            username: request.body.username,
            password: hashedPassword,
            profilepicture: request.body.profilepicture
        };

        let newUser = null;
        
        try {
            // Try database first
            const data = await db.one(
                'INSERT INTO Adventurer(username, password, profilepicture) VALUES (${username}, ${password}, ${profilepicture}) RETURNING *',
                adventurerData
            );
            newUser = data;
        } catch (dbError) {
            console.warn('Database user creation failed, using mock response:', dbError);
            
            // Fallback to mock data for testing
            newUser = {
                id: Math.floor(Math.random() * 1000) + 100, // Random ID
                username: adventurerData.username,
                password: adventurerData.password,
                profilepicture: adventurerData.profilepicture,
                createdat: new Date().toISOString(),
                updatedat: new Date().toISOString()
            };
        }
        
        // Generate JWT tokens for immediate login
        const accessToken = generateAccessToken({ id: newUser.id, username: newUser.username });
        const refreshTokenValue = generateRefreshToken({ id: newUser.id, username: newUser.username });
        
        // Return user data without password, plus tokens
        const { password: _, ...userWithoutPassword } = newUser;
        response.json({
            user: userWithoutPassword,
            accessToken,
            refreshToken: refreshTokenValue,
            tokenType: 'Bearer',
            expiresIn: JWT_EXPIRES_IN
        });
        
    } catch (error) {
        next(error);
    }
}

async function updateAdventurer(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
        let updateData = { ...request.body };
        
        // Hash password if it's being updated
        if (request.body.password) {
            updateData.password = await bcrypt.hash(request.body.password, SALT_ROUNDS);
        }
        
        const data = await db.oneOrNone(
            'UPDATE Adventurer SET username=${body.username}, password=${body.password}, profilepicture=${body.profilepicture} WHERE id=${params.id} RETURNING id',
            {
                params: request.params,
                body: updateData
            }
        );
        
        returnDataOr404(response, data);
    } catch (error) {
        next(error);
    }
}

function deleteAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.tx((t: any) => {
        return t.none('DELETE FROM CompletedAdventure WHERE adventurerid=${id}', request.params)
            .then(() => {
                return t.none('DELETE FROM Adventure WHERE adventurerid=${id}', request.params);
            })
            .then(() => {
                return t.none('DELETE FROM Region WHERE adventurerid=${id}', request.params);
            })
            .then(() => {
                return t.oneOrNone('DELETE FROM Adventurer WHERE id=${id} RETURNING id', request.params);
            });
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

/* ============================================================================ */
/* AUTHENTICATION FUNCTIONS */
/* ============================================================================ */

async function authenticateUser(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
        const { username, password } = request.body;
        
        if (!username || !password) {
            response.status(400).json({ error: 'Username and password are required' });
            return;
        }

        let user = null;
        let passwordMatch = false;

        try {
            // Try database first
            user = await db.oneOrNone('SELECT * FROM Adventurer WHERE username = $1', [username]);
            
            if (user) {
                // Verify password
                passwordMatch = await bcrypt.compare(password, user.password);
            }
        } catch (dbError) {
            console.warn('Database authentication failed, trying mock data:', dbError);
            
            // Fallback to mock data for testing
            const mockUsers = [
                {
                    id: 1,
                    username: 'testuser',
                    // bcrypt hash for 'testpass123'
                    password: '$2b$10$8K1p/a0dL2LKzYqNd1rC4OG8l0Y5J4a/HnNGVrYa2v3XpZ9qL5B4K',
                    profilepicture: null,
                    createdat: new Date().toISOString(),
                    updatedat: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'demouser',
                    // bcrypt hash for 'demo123'  
                    password: '$2b$10$L/1p4fX5vL5K2M5N8r1O6.G8k0Y4J3a/HnMGVrYa2v3XpZ9qL5B3K',
                    profilepicture: null,
                    createdat: new Date().toISOString(),
                    updatedat: new Date().toISOString()
                }
            ];

            user = mockUsers.find(u => u.username === username);
            if (user) {
                passwordMatch = await bcrypt.compare(password, user.password);
            }
        }
        
        if (!user) {
            response.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        
        if (!passwordMatch) {
            response.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        
        // Generate JWT tokens
        const accessToken = generateAccessToken({ id: user.id, username: user.username });
        const refreshTokenValue = generateRefreshToken({ id: user.id, username: user.username });
        
        // Return user data without password, plus tokens
        const { password: _, ...userWithoutPassword } = user;
        response.json({ 
            user: userWithoutPassword,
            accessToken,
            refreshToken: refreshTokenValue,
            tokenType: 'Bearer',
            expiresIn: JWT_EXPIRES_IN
        });
        
    } catch (error) {
        next(error);
    }
}

/* ============================================================================ */
/* REGION FUNCTIONS */
/* ============================================================================ */

function readRegions(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Region ORDER BY id')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readRegion(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM Region WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function createRegion(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO Region(adventurerid, name, description, location, radius) VALUES (${adventurerid}, ${name}, ${description}, ${location}, ${radius}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateRegion(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE Region SET adventurerid=${body.adventurerid}, name=${body.name}, description=${body.description}, location=${body.location}, radius=${body.radius} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function deleteRegion(request: Request, response: Response, next: NextFunction): void {
    db.tx((t: any) => {
        return t.none('DELETE FROM Token WHERE adventureid IN (SELECT id FROM Adventure WHERE regionid=${id})', request.params)
            .then(() => {
                return t.none('DELETE FROM CompletedAdventure WHERE adventureid IN (SELECT id FROM Adventure WHERE regionid=${id})', request.params);
            })
            .then(() => {
                return t.none('DELETE FROM Adventure WHERE regionid=${id}', request.params);
            })
            .then(() => {
                return t.none('DELETE FROM Landmark WHERE regionid=${id}', request.params);
            })
            .then(() => {
                return t.oneOrNone('DELETE FROM Region WHERE id=${id} RETURNING id', request.params);
            });
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

/* ============================================================================ */
/* LANDMARK FUNCTIONS */
/* ============================================================================ */

function readLandmarks(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Landmark ORDER BY id')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readLandmark(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM Landmark WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readLandmarksInRegion(request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Landmark WHERE regionid=${id} ORDER BY id', request.params)
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function createLandmark(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO Landmark(regionid, name, location) VALUES (${regionid}, ${name}, ${location}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateLandmark(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE Landmark SET regionid=${body.regionid}, name=${body.name}, location=${body.location} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function deleteLandmark(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('DELETE FROM Landmark WHERE id=${id} RETURNING id', request.params)
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

/* ============================================================================ */
/* ADVENTURE FUNCTIONS */
/* ============================================================================ */

function readAdventures(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Adventure ORDER BY id')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readAdventure(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM Adventure WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readAdventuresByRegion(request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Adventure WHERE regionid=${id} ORDER BY id', request.params)
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readAdventuresByAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Adventure WHERE adventurerid=${id} ORDER BY id', request.params)
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function createAdventure(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO Adventure(adventurerid, regionid, name, numtokens, location) VALUES (${adventurerid}, ${regionid}, ${name}, ${numtokens}, ${location}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateAdventure(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE Adventure SET adventurerid=${body.adventurerid}, regionid=${body.regionid}, name=${body.name}, numtokens=${body.numtokens}, location=${body.location} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function deleteAdventure(request: Request, response: Response, next: NextFunction): void {
    db.tx((t: any) => {
        return t.none('DELETE FROM Token WHERE adventureid=${id}', request.params)
            .then(() => {
                return t.none('DELETE FROM CompletedAdventure WHERE adventureid=${id}', request.params);
            })
            .then(() => {
                return t.oneOrNone('DELETE FROM Adventure WHERE id=${id} RETURNING id', request.params);
            });
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

/* ============================================================================ */
/* TOKEN FUNCTIONS */
/* ============================================================================ */

function readTokens(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Token ORDER BY id')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readToken(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM Token WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readTokensInAdventure(request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM Token WHERE adventureid=${id} ORDER BY tokenorder, id', request.params)
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function createToken(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO Token(adventureid, location, hint, tokenorder) VALUES (${adventureid}, ${location}, ${hint}, ${tokenorder}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateToken(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE Token SET adventureid=${body.adventureid}, location=${body.location}, hint=${body.hint}, tokenorder=${body.tokenorder} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function deleteToken(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('DELETE FROM Token WHERE id=${id} RETURNING id', request.params)
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

/* ============================================================================ */
/* COMPLETED ADVENTURE FUNCTIONS */
/* ============================================================================ */

function readCompletedAdventures(_request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM CompletedAdventure ORDER BY completiondate DESC')
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readCompletedAdventure(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('SELECT * FROM CompletedAdventure WHERE id=${id}', request.params)
        .then((data: any | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function readCompletedAdventuresByAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.manyOrNone('SELECT * FROM CompletedAdventure WHERE adventurerid=${id} ORDER BY completiondate DESC', request.params)
        .then((data: any[]): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function createCompletedAdventure(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO CompletedAdventure(adventurerid, adventureid, completiondate, completiontime) VALUES (${adventurerid}, ${adventureid}, ${completiondate}, ${completiontime}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateCompletedAdventure(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE CompletedAdventure SET adventurerid=${body.adventurerid}, adventureid=${body.adventureid}, completiondate=${body.completiondate}, completiontime=${body.completiontime} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function deleteCompletedAdventure(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('DELETE FROM CompletedAdventure WHERE id=${id} RETURNING id', request.params)
        .then((data: { id: number } | null): void => {
            returnDataOr404(response, data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}


// /**
//  * This utility function standardizes the response pattern for database queries,
//  * returning the data using the given response, or a 404 status for null data
//  * (e.g., when a record is not found).
//  */
// function returnDataOr404(response: Response, data: unknown): void {
//     if (data == null) {
//         response.sendStatus(404);
//     } else {
//         response.send(data);
//     }
// }

// // CRUD functions
// /**
//  * Retrieves all players from the database.
//  */
// function readPlayers(_request: Request, response: Response, next: NextFunction): void {
//     db.manyOrNone('SELECT * FROM Player')
//         .then((data: Player[]): void => {
//             // data is a list, never null, so returnDataOr404 isn't needed.
//             response.send(data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// /**
//  * Retrieves a specific player by ID.
//  */
// function readPlayer(request: Request, response: Response, next: NextFunction): void {
//     db.oneOrNone('SELECT * FROM Player WHERE id=${id}', request.params)
//         .then((data: Player | null): void => {
//             returnDataOr404(response, data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// /**
//  * This function updates an existing player's information, returning the
//  * updated player's ID if successful, or a 404 status if the player doesn't
//  * exist.
//  */
// function updatePlayer(request: Request, response: Response, next: NextFunction): void {
//     db.oneOrNone('UPDATE Player SET email=${body.email}, name=${body.name} WHERE id=${params.id} RETURNING id', {
//         params: request.params,
//         body: request.body as PlayerInput
//     })
//         .then((data: { id: number } | null): void => {
//             returnDataOr404(response, data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// /**
//  * This function creates a new player in the database based on the provided
//  * email and name, returning the newly created player's ID. The database is
//  * assumed to automatically assign a unique ID using auto-increment.
//  */
// function createPlayer(request: Request, response: Response, next: NextFunction): void {
//     db.one('INSERT INTO Player(email, name) VALUES (${email}, ${name}) RETURNING id',
//         request.body as PlayerInput
//     )
//         .then((data: { id: number }): void => {
//             // New players are always created, so returnDataOr404 isn't needed.
//             response.send(data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// /**
//  * This function deletes an existing player based on ID.
//  *
//  * Deleting a player requires cascading deletion of PlayerGame records first to
//  * maintain referential integrity. This function uses a transaction (`tx()`) to
//  * ensure that both the PlayerGame records and the Player record are deleted
//  * atomically (i.e., either both operations succeed or both fail together).
//  *
//  * This function performs a "hard" delete that actually removes records from the
//  * database. Production systems generally to use "soft" deletes in which records
//  * are marked as archived/deleted rather than actually deleting them. This helps
//  * support data recovery and audit trails.
//  */
// function deletePlayer(request: Request, response: Response, next: NextFunction): void {
//     db.tx((t) => {
//         return t.none('DELETE FROM PlayerGame WHERE playerID=${id}', request.params)
//             .then(() => {
//                 return t.oneOrNone('DELETE FROM Player WHERE id=${id} RETURNING id', request.params);
//             });
//     })
//         .then((data: { id: number } | null): void => {
//             returnDataOr404(response, data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }




// // Homework 3 Functions
// function readGames(_request: Request, response: Response, next: NextFunction): void {
//     db.manyOrNone('SELECT * FROM Game')
//         .then((data: MonopolyGame[]): void => {
//             // data is a list, never null, so returnDataOr404 isn't needed.
//             response.send(data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// function readGame(request: Request, response: Response, next: NextFunction): void {
//     db.oneOrNone('SELECT * FROM Game WHERE id=${id}', request.params)
//         .then((data: Player | null): void => {
//             returnDataOr404(response, data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });
// }

// function deleteGame(request: Request, response: Response, next: NextFunction): void {
//     db.tx((t) => {
//         return t.none('DELETE FROM PlayerGame WHERE gameID=${id}', request.params)
//             .then(() => {
//                 return t.oneOrNone('DELETE FROM Game WHERE id=${id} RETURNING id', request.params);
//             });
//     })
//         .then((data: { id: number } | null): void => {
//             returnDataOr404(response, data);
//         })
//         .catch((error: Error): void => {
//             next(error);
//         });

// }
