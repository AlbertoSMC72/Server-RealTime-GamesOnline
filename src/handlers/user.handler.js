const { Socket } = require("socket.io");

module.exports = (io, socket) => {

    console.log('Nuevo jugador conectado');

    // Crear una nueva sala para el jugador
    const roomID = socket.id;
    socket.join(roomID);
    rooms[roomID] = {
        players: [socket.id],
        numberToGuess: Math.floor(Math.random() * 10) + 1,
    };

    // Enviar mensaje inicial al jugador
    socket.emit('message', `¡Bienvenido a la sala ${roomID}! Adivina el número del 1 al 10.`);

    // Manejar eventos del juego
    socket.on('guess', (guess) => {
        const room = rooms[roomID];

        if (guess === room.numberToGuess.toString()) {
            io.to(roomID).emit('message', '¡Felicidades! Has adivinado el número.');
            io.to(roomID).emit('gameOver');
        } else {
            io.to(roomID).emit('message', `Intento incorrecto. ¡Sigue intentando!`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Jugador desconectado');

        // Eliminar la sala si ya no hay jugadores
        if (rooms[roomID]) {
            const index = rooms[roomID].players.indexOf(socket.id);
            if (index !== -1) {
                rooms[roomID].players.splice(index, 1);
            }

            if (rooms[roomID].players.length === 0) {
                delete rooms[roomID];
            }
        }
    });
}