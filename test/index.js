const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3001;

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.emit('conectado', { message: '¡Conexión exitosa!' });
    const gameRooms = {};

    socket.on('iniciarJuego', (data) => {
        const { roomId, numeroAdivinar } = data;

        // Verificar si la sala ya existe
        if (!gameRooms[roomId]) {
            gameRooms[roomId] = {
                numeroAdivinar,
                jugadores: [socket.id],
                intentos: {},
            };

            // Unir al jugador a la sala
            socket.join(roomId);

            // Emitir evento para indicar que el juego ha comenzado
            io.to(roomId).emit('juegoIniciado', { mensaje: '¡El juego ha comenzado! Adivina el número.' });
        } else {
            // Si la sala ya existe, emitir un mensaje de error
            socket.emit('error', { mensaje: 'La sala ya está ocupada o el juego ya ha comenzado.' });
        }
    });

    socket.on('adivinanza', (data) => {
        const { roomId, numeroAdivinanza } = data;
        const gameRoom = gameRooms[roomId];

        // Verificar si la sala existe y el jugador está en la sala
        if (gameRoom && gameRoom.jugadores.includes(socket.id)) {
            // Incrementar los intentos del jugador
            if (!gameRoom.intentos[socket.id]) {
                gameRoom.intentos[socket.id] = 1;
            } else {
                gameRoom.intentos[socket.id]++;
            }

            // Emitir el resultado al jugador que hizo la adivinanza
            socket.emit('resultadoAdivinanza', {
                resultado: numeroAdivinanza === gameRoom.numeroAdivinar,
                intentos: gameRoom.intentos[socket.id],
            });

            // Emitir el resultado al otro jugador en la sala
            socket.to(roomId).emit('resultadoAdivinanza', {
                resultado: numeroAdivinanza === gameRoom.numeroAdivinar,
                intentos: gameRoom.intentos[socket.id],
            });

            // Si adivinaron el número, finalizar el juego y limpiar la sala
            if (numeroAdivinanza === gameRoom.numeroAdivinar) {
                io.to(roomId).emit('juegoTerminado', { mensaje: `¡El jugador ${socket.id} adivinó el número en ${gameRoom.intentos[socket.id]} intentos!` });
                delete gameRooms[roomId];
            }
        } else {
            // Si la sala no existe o el jugador no está en la sala, emitir un mensaje de error
            socket.emit('error', { mensaje: 'No puedes hacer adivinanzas en esta sala.' });
        }
    });


    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor Socket.IO en http://localhost:${PORT}`);
});
