const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

// Request Endpoints
router.post('/order-increase', approvalController.createOrderIncreaseRequest);
router.post('/rewinding', approvalController.createRewindingRequest);

// Pending Listing Endpoints
router.get('/order-increase/pending', approvalController.getPendingOrderIncreases);
router.get('/rewinding/pending', approvalController.getPendingRewindings);

// Admin Action Endpoints
router.put('/order-increase/:id/approve', approvalController.approveOrderIncrease);
router.put('/order-increase/:id/reject', approvalController.rejectOrderIncrease);
router.put('/rewinding/:id/approve', approvalController.approveRewinding);
router.put('/rewinding/:id/reject', approvalController.rejectRewinding);

module.exports = router;
