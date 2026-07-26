const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authenticateToken = require('../middlewares/auth');

router.get('/', authenticateToken, companyController.getProfile);
router.post('/', authenticateToken, companyController.saveProfile);
router.put('/', authenticateToken, companyController.saveProfile);

module.exports = router;
