const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateToken = require('../middlewares/auth');

router.get('/', authenticateToken, employeeController.getAllActive);
router.post('/', authenticateToken, employeeController.create);
router.put('/:id', authenticateToken, employeeController.update);
router.delete('/:id', authenticateToken, employeeController.delete);

module.exports = router;
