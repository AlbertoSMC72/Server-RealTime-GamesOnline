const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS_BCRYPT);
const User = require('../models/user.model');

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "usuario no encontrado"
            });
        }

        return res.status(200).json({
            message: "se obtuvo el usuario correctamente",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "ocurrió un error al obtener el usuario",
            error: error.message
        })
    }
}

const getAll = async (req, res) => {
    try {
        const users = await User.find();

        return res.status(200).json({
            message: "se obtuvieron los usuarios correctamente",
            users
        });
    } catch (error) {
        return res.status(500).json({
            message: "ocurrió un error al obtener los usuarios",
            error: error.message
        })
    }
}

const create = async (req, res) => {
    try {
        let user = new User({
            name: req.body.name,
            puntos: req.body.puntos,
            password: bcrypt.hashSync(req.body.password, saltRounds)
        });

        await user.save();

        return res.status(201).json({
            message: "usuario creado exitosamente!",
            usuario: user
        });
    } catch (error) {
        return res.status(500).json({
            message: "no se pudo crear el usuario",
            error: error.message
        });
    }
}

module.exports = {
    getById,
    create,
    getAll
}