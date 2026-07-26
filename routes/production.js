const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', productionController.getAll);
router.post('/', productionController.create);

module.exports = router;
