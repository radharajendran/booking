"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = exports.app = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const prisma_1 = __importDefault(require("./prisma"));
exports.app = (0, express_1.default)();
// Logging
exports.app.use((0, morgan_1.default)('dev'));
// Parse the request
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use(express_1.default.json());
// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
exports.app.use('/api-docs', swaggerUi.serve);
exports.app.get('/api-docs', swaggerUi.setup(swaggerDocument));
// Routes
exports.app.use('/', bookings_1.default);
// Error handling
exports.app.use((req, res, next) => {
    const error = new Error('Not found');
    res.status(404).json({
        message: error.message,
    });
});
// Server
let server;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const port = 8000;
            server = http_1.default.createServer(exports.app);
            server.listen(port, () => {
                console.log(`The server is running on http://localhost:${port}`);
                resolve('Server started');
            }).on('error', (error) => {
                reject(error);
            });
        });
    });
}
exports.startServer = startServer;
function stopServer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve('Server stopped');
            });
        });
    });
}
exports.stopServer = stopServer;
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_1.default.$connect();
            // Start the server if not running
            if (!server) {
                yield startServer();
            }
        }
        catch (error) {
            console.error(error);
            yield prisma_1.default.$disconnect();
            process.exit(1);
        }
    });
}
initialize().then(() => {
    console.log('Initialized');
}).catch((error) => {
    console.error(error);
});
