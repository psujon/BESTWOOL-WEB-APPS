const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken); // Authenticate all endpoints

router.get('/', colorController.getAll);
router.post('/', colorController.create);
router.put('/:id', colorController.update);
router.delete('/:id', colorController.delete);

module.exports = router;
