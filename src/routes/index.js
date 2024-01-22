const express = require('express');
const router = express.Router();
const authRouter = require('./auth.route');
const usersRouter = require('./users.route');

router.use('/auth', authRouter);
router.use('/users', usersRouter);

module.exports = router;