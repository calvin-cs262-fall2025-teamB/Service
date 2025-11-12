"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const pg_promise_1 = __importDefault(require("pg-promise"));
dotenv_1.default.config();
const db = (0, pg_promise_1.default)()({
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
db.connect()
    .then((obj) => {
    console.log('Database connection successful');
    obj.done();
})
    .catch((error) => {
    console.log('Database connection failed:', error.message);
});
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT) || 3000;
const router = express_1.default.Router();
router.use(express_1.default.json());
router.get('/', readHello);
router.get('/test', testEndpoint);
router.get('/adventures', readAdventures);
router.get('/adventuresInRegion/:id', readAdventuresByRegion);
app.use(router);
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
function returnDataOr404(response, data) {
    if (data == null) {
        response.sendStatus(404);
    }
    else {
        response.send(data);
    }
}
function readHello(_request, response, next) {
    try {
        console.log('Hello endpoint called');
        console.log('Environment check:');
        console.log('DB_SERVER:', process.env.DB_SERVER ? 'Set' : 'Missing');
        console.log('DB_DATABASE:', process.env.DB_DATABASE ? 'Set' : 'Missing');
        console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Missing');
        console.log('PORT:', process.env.PORT);
        console.log('NODE_ENV:', process.env.NODE_ENV);
        response.json({
            message: 'Hello, CS 262 Adventure Game service!',
            status: 'Service is running',
            timestamp: new Date().toISOString(),
            environment: {
                dbServerSet: !!process.env.DB_SERVER,
                dbDatabaseSet: !!process.env.DB_DATABASE,
                dbUserSet: !!process.env.DB_USER,
                port: process.env.PORT || 3000,
                nodeEnv: process.env.NODE_ENV || 'development'
            }
        });
    }
    catch (error) {
        console.error('Error in readHello:', error);
        next(error);
    }
}
function testEndpoint(_request, response, next) {
    try {
        response.json({
            message: 'Test endpoint working',
            timestamp: new Date().toISOString(),
            status: 'OK'
        });
    }
    catch (error) {
        next(error);
    }
}
function readAdventures(request, response, next) {
    db.manyOrNone('SELECT * FROM Adventure')
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
function readAdventuresByRegion(request, response, next) {
    db.manyOrNone('SELECT * FROM Adventure WHERE regionID=${id}', request.params)
        .then((data) => {
        response.send(data);
    })
        .catch((error) => {
        next(error);
    });
}
