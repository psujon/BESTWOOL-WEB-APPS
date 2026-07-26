const express = require('express');
const router = express.Router();
const buyerOrderController = require('../controllers/buyerOrderController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', buyerOrderController.getAll);
router.post('/', buyerOrderController.create);
router.put('/:id', buyerOrderController.update);
router.delete('/:id', buyerOrderController.delete);

module.exports = router;
