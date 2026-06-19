// routes/installmentRoute.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const { payInstallment } = require("../controllers/installment-controller");

// POST /api/installments/:planId/pay  (customer)
router.post("/:planId/pay", auth("customer"), payInstallment);

module.exports = router;
