const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS_BCRYPT);
const User = require('../models/user.model');

module.exports = (io, socket) => {

    const readUser = async (userId) => {
        try {
            const user = await User.findById(userId);

            if (!user) {
                socket.emit("user:not_found", "el usuario no fue encontrado");
                return
            }

            socket.emit("user:read_success", user);
        } catch (error) {
            const data = {
                message: "ocurrió un error al obtener usuario",
                error: error.message
            }

            socket.emit("user:read_error", data);
        }
    }

    const createUser = async (payload) => {
        try {
            const user = new User({
                ...payload, 
                password: bcrypt.hashSync(req.body.password, saltRounds)
            });

            await user.save();

            // emite evento al cliente que creó la notificación
            socket.emit("user:create_success", user);

            // emite evento a todos los clientes
            io.emit('user:created', user);
        } catch (error) {
            const data = {
                message: "ocurrió un error al crear el usuario",
                error: error.message
            }

            socket.emit("user:create_error", data);
        }
    }

    socket.on("user:read", readUser);
    socket.on("user:create", createUser);
}