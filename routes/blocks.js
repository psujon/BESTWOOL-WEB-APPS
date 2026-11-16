const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken); // Guard all endpoints

router.get('/', blockController.getAll);
router.post('/', blockController.create);
router.put('/:id', blockController.update);
router.delete('/:id', blockController.delete);

module.exports = router;
