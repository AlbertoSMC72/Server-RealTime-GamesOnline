const jwt = require('jsonwebtoken');
const secretJWT = process.env.SECRET_JWT;

const verifyJWT = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
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