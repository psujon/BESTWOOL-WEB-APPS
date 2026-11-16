const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/employee', reportController.getEmployeeReport);
router.get('/pdf/employee', reportController.generateEmployeePdf);

router.get('/pdf/monthly-production', reportController.generateMonthlyProductionPdf);
router.get('/pdf/monthly-wages', reportController.generateMonthlyWagesPdf);
router.get('/pdf/monthly-production-statement', reportController.generateMonthlyProductionStatementPdf);
router.get('/pdf/monthly-rate-sheet', reportController.generateMonthlyRateSheetPdf);
router.get('/pdf/buyer-order', reportController.generateBuyerOrderPdf);

router.get('/production', reportController.getProductionReport);
router.get('/buyer-order', reportController.getBuyerOrderReport);

module.exports = router;
