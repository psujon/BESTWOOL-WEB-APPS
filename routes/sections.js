const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken); // Guard all endpoints

router.get('/', sectionController.getAll);
router.post('/', sectionController.create);
router.put('/:id', sectionController.update);
router.delete('/:id', sectionController.delete);

module.exports = router;
