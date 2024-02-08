const jwt = require('jsonwebtoken');
const secretJWT = process.env.SECRET_JWT;

const verifyJWT = (socket, next) => {
    try {
        //poner al hacer la petición en socketio 
        //headers: { authorization: `${token}` }
        const token = socket.handshake.headers.authorization;
        
        if (!token) {
            throw new Error('Token no encontrado');
        }

        jwt.verify(token, secretJWT, (err, decode) => {
            if (err) {
                next(err);
            }

            socket.user = decode;
            next();
        });
    } catch (error) {  
        next(error);
    }
}

module.exports = {
    verifyJWT
}