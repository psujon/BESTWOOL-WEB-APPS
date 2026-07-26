const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', backupController.getAll);
router.post('/', backupController.create);

module.exports = router;
