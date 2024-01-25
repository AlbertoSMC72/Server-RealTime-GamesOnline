const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/http/auth.middleware');

router.get('/:id', authMiddleware.verifyJWT, usersController.getById);
router.get('/', authMiddleware.verifyJWT, usersController.getAll);
router.post('/', usersController.create);
router.put('/:id', authMiddleware.verifyJWT, usersController.update);
router.delete('/', (req, res) => res.json({m: 1}));

module.exports = router;