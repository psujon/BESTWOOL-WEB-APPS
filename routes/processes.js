const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', processController.getAll);
router.post('/', processController.create);
router.put('/:id', processController.update);
router.delete('/:id', processController.delete);

module.exports = router;
