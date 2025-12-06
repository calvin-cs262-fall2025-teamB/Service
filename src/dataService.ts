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

import dotenv from 'dotenv';
import express from 'express';
import pgPromise from 'pg-promise';

// Load environment variables from .env file
dotenv.config();

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

// Add database connection test
db.connect()
    .then((obj) => {
        console.log('Database connection successful');
        obj.done(); // success, release connection
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message);
    });

// Configure the server and its routes
const app = express();
const port: number = parseInt(process.env.PORT as string) || 3000;
const router = express.Router();

router.use(express.json());

router.get('/', readHello);
router.get('/test', testEndpoint);

/* ============================================================================ */
/* ADVENTURER ROUTES */
/* ============================================================================ */
router.get('/adventurers', readAdventurers);
router.get('/adventurer/:id', readAdventurer);
router.post('/adventurers', createAdventurer);
router.put('/adventurer/:id', updateAdventurer);
router.delete('/adventurer/:id', deleteAdventurer);

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

function createAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.one('INSERT INTO Adventurer(username, password, profilepicture) VALUES (${username}, ${password}, ${profilepicture}) RETURNING id',
        request.body
    )
        .then((data: { id: number }): void => {
            response.send(data);
        })
        .catch((error: Error): void => {
            next(error);
        });
}

function updateAdventurer(request: Request, response: Response, next: NextFunction): void {
    db.oneOrNone('UPDATE Adventurer SET username=${body.username}, password=${body.password}, profilepicture=${body.profilepicture} WHERE id=${params.id} RETURNING id', {
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
