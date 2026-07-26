const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', userController.getAll);
router.post('/', userController.create);

module.exports = router;
