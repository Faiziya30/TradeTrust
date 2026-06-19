// routes/returnRoute.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth-middleware");
const requireMerchant = require("../middleware/requireMerchant");

const {
  requestReturn,
  approveReturn,
  rejectReturn,
  listPendingReturns,
} = require("../controllers/return-controller");

// Customer: request a return
router.post("/:id/request-return", auth(), requestReturn);

// Admin: approve return
router.post("/:id/approve-return", auth(), requireMerchant, approveReturn);

// Admin: reject return
router.post("/:id/reject-return", auth(), requireMerchant, rejectReturn);

// Merchant: list pending return requests
router.get("/returns/pending", auth(), requireMerchant, listPendingReturns);

module.exports = router;
