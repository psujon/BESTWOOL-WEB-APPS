const express = require('express');
const router = express.Router();
const yarnChallanController = require('../controllers/yarnChallanController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken); // Authenticate all endpoints

router.get('/', yarnChallanController.getAll);
router.post('/', yarnChallanController.create);
router.put('/:id', yarnChallanController.update);
router.delete('/:id', yarnChallanController.delete);

module.exports = router;
