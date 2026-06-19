// routes/installmentRoute.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");
const { payInstallment } = require("../controllers/installment-controller");
const { validate } = require('../middleware/validate');
const { payInstallmentSchema } = require('../validators/installmentValidators');

// POST /api/installments/:planId/pay  (customer)
router.post("/:planId/pay", auth("customer"), validate(payInstallmentSchema), payInstallment);

module.exports = router;
