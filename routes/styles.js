const express = require('express');
const router = express.Router();
const styleController = require('../controllers/styleController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', styleController.getAll);
router.post('/', styleController.create);
router.put('/:id', styleController.update);
router.delete('/:id', styleController.delete);

module.exports = router;
