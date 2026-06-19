const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth-middleware");

const {
  getDashboard,
  getCustomers,
  getCustomerDetail,
  performAction,
  getSuspiciousActivity,
  notifyCustomer,
} = require("../controllers/merchant-controller");
const { validate } = require('../middleware/validate');
const { performActionSchema, notifySchema } = require('../validators/merchantValidators');

// Secure merchant endpoints: require authentication for merchant-related data.
// Dashboard and customers listing should be authenticated to avoid data leak.
router.get('/:merchantId/dashboard', auth(), getDashboard);

router.get('/:merchantId/customers', auth(), getCustomers);

router.get(
  '/:merchantId/customers/:customerId/detail',
  auth(),
  getCustomerDetail
);

router.post('/:merchantId/customers/:customerId/action', auth(), validate(performActionSchema), performAction);

router.get('/:merchantId/suspicious', auth(), getSuspiciousActivity);
router.post('/:merchantId/customers/:customerId/notify', auth(), validate(notifySchema), notifyCustomer);

// NOTE: removed debug endpoint that exposed raw orders. Keep debug-only helpers
// out of production routes or guarded by environment checks.

module.exports = router;
