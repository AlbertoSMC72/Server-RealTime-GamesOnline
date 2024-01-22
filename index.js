require('dotenv').config();
require('./src/configs/db.config');

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Creación del servidor
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://127.0.0.1:5173"
    },
    pingInterval: 1000,
    pingTimeout: 2000
});

// Middlewares globales de express
app.use(cors());
app.use(express.json());

// Configuración de rutas HTTP
const routes = require('./src/routes');
app.use(routes);

// Configuración de middleware de socket.io
const authMiddleware = require('./src/middlewares/socketio/auth.middleware');
io.use(authMiddleware.verifyJWT);

// Configuración de handlers de socket.io
const registerUserHandlers = require('./src/handlers/user.handler');

const onConnection = (socket) => {
    registerUserHandlers(io, socket);
}

io.on('connection', onConnection);


// Levantar servidor
const PORT = process.env.PORT;
httpServer.listen(PORT);
