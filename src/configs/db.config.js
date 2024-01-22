const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("conectado a mongodb exitosamente"))
    .catch(console.log);