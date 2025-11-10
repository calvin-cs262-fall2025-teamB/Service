"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const express = require("express");
const pgPromise = require("pg-promise");
// Load environment variables from .env file
dotenv.config();
// Set up the database
const db = pgPromise()({
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
// Configure the server and its routes
const app = express();
const port = parseInt(process.env.PORT) || 3000;
const router = express.Router();
router.use(express.json());
router.get('/', readHello);
router.get('/players', readPlayers);
router.get('/players/:id', readPlayer);
router.put('/players/:id', updatePlayer);
router.post('/players', createPlayer);
router.delete('/players/:id', deletePlayer);
// Homework 3 Endpoints
router.get('/games', readGames);
router.get('/games/:id', readGame);
router.delete('/games/:id', deleteGame);
// Project routes (ignore for Lab/HW)
router.get('/adventures', readAdventures);
router.get('/adventuresInRegion/:id', readAdventuresByRegion);
app.use(router);
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
/**
 * This utility function standardizes the response pattern for database queries,
 * returning the data using the given response, or a 404 status for null data
 * (e.g., when a record is not found).
 */
function returnDataOr404(response, data) {
    if (data == null) {
        response.sendStatus(404);
    }
    else {
        response.send(data);
    }
}
/**
 * This endpoint returns a simple hello-world message, serving as a basic
 * health check and welcome message for the API.
 */
function readHello(_request, response) {
    response.send('Hello, CS 262 Adventure Game service!');
}
// CRUD functions
/**
 * Retrieves all players from the database.
 */
function readPlayers(_request, response, next) {
    db.manyOrNone('SELECT * FROM Player')
        .then((data) => {
        // data is a list, never null, so returnDataOr404 isn't needed.
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * Retrieves a specific player by ID.
 */
function readPlayer(request, response, next) {
    db.oneOrNone('SELECT * FROM Player WHERE id=${id}', request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * This function updates an existing player's information, returning the
 * updated player's ID if successful, or a 404 status if the player doesn't
 * exist.
 */
function updatePlayer(request, response, next) {
    db.oneOrNone('UPDATE Player SET email=${body.email}, name=${body.name} WHERE id=${params.id} RETURNING id', {
        params: request.params,
        body: request.body
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * This function creates a new player in the database based on the provided
 * email and name, returning the newly created player's ID. The database is
 * assumed to automatically assign a unique ID using auto-increment.
 */
function createPlayer(request, response, next) {
    db.one('INSERT INTO Player(email, name) VALUES (${email}, ${name}) RETURNING id', request.body)
        .then((data) => {
        // New players are always created, so returnDataOr404 isn't needed.
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
/**
 * This function deletes an existing player based on ID.
 *
 * Deleting a player requires cascading deletion of PlayerGame records first to
 * maintain referential integrity. This function uses a transaction (`tx()`) to
 * ensure that both the PlayerGame records and the Player record are deleted
 * atomically (i.e., either both operations succeed or both fail together).
 *
 * This function performs a "hard" delete that actually removes records from the
 * database. Production systems generally to use "soft" deletes in which records
 * are marked as archived/deleted rather than actually deleting them. This helps
 * support data recovery and audit trails.
 */
function deletePlayer(request, response, next) {
    db.tx((t) => {
        return t.none('DELETE FROM PlayerGame WHERE playerID=${id}', request.params)
            .then(() => {
            return t.oneOrNone('DELETE FROM Player WHERE id=${id} RETURNING id', request.params);
        });
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
// Homework 3 Functions
function readGames(_request, response, next) {
    db.manyOrNone('SELECT * FROM Game')
        .then((data) => {
        // data is a list, never null, so returnDataOr404 isn't needed.
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
function readGame(request, response, next) {
    db.oneOrNone('SELECT * FROM Game WHERE id=${id}', request.params)
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
function deleteGame(request, response, next) {
    db.tx((t) => {
        return t.none('DELETE FROM PlayerGame WHERE gameID=${id}', request.params)
            .then(() => {
            return t.oneOrNone('DELETE FROM Game WHERE id=${id} RETURNING id', request.params);
        });
    })
        .then((data) => {
        returnDataOr404(response, data);
    })
        .catch((error) => {
        next(error);
    });
}
/*
PROJECT ROUTES
*/
// Get all adventures
function readAdventures(request, response, next) {
    db.manyOrNone('SELECT * FROM Adventure')
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
// Get all adventures in region 
function readAdventuresByRegion(request, response, next) {
    db.manyOrNone('SELECT * FROM Adventure WHERE regionID=${id}', request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
