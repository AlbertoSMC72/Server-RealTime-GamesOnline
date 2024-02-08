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
        origin: "*"
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
/* const authMiddleware = require('./src/middlewares/socketio/auth.middleware');
io.use(authMiddleware.verifyJWT); */

// Configuración de handlers de socket.io

const activeRooms = new Map();

io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado', socket.id);

    io.emit('newConnection', `Jugador ${socket.id} se ha conectado`);

    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(7);
        socket.join(roomId);
        activeRooms.set(roomId, { players: [{ id: socket.id, choice: '' }] });
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        const room = activeRooms.get(roomId);
        if (!room || room.players.length >= 2) {
            socket.emit('roomNotFound');
            return;
        }
        socket.join(roomId);
        room.players.push({ id: socket.id, choice: '' });
        io.to(roomId).emit('playerJoined', room.players);
        if (room.players.length === 2) {
            io.to(roomId).emit('gameStart');
        }
    });

    socket.on('play', ({ roomId, choice }) => {
        const room = activeRooms.get(roomId);
        const player = room.players.find((player) => player.id === socket.id);
        player.choice = choice;

        // Verificar si ambos jugadores han realizado su jugada
        if (room.players.every((player) => player.choice !== '')) {
            // Evaluar el resultado
            const [player1, player2] = room.players;
            const result = evaluateWinner(player1.choice, player2.choice);

            // Enviar información de qué jugador perdió
            const loser = result === '¡Ganaste!' ? player2 : player1;
            const winner = result === '¡Ganaste!' ? player1 : player2;

            io.to(roomId).emit('result', { result, loser, winner });
        }
    });
    socket.on('disconnect', () => {
        console.log('Jugador desconectado', socket.id);
        activeRooms.forEach((room, roomId) => {
            const index = room.players.findIndex((player) => player.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                io.to(roomId).emit('playerLeft', room.players);
                if (room.players.length === 0) {
                    activeRooms.delete(roomId);
                }
            }
        });
    });
});

function evaluateWinner(choice1, choice2) {
    if (choice1 === choice2) {
        return '¡Empate!';
    } else if (
        (choice1 === 'piedra' && choice2 === 'tijeras') ||
        (choice1 === 'papel' && choice2 === 'piedra') ||
        (choice1 === 'tijeras' && choice2 === 'papel')
    ) {
        return '¡Ganaste!';
    } else {
        return '¡Perdiste!';
    }
}

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});