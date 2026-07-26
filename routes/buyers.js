const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken); // Authenticate all requests

router.get('/', buyerController.getAll);
router.post('/', buyerController.create);
router.put('/:id', buyerController.update);
router.delete('/:id', buyerController.delete);

module.exports = router;
