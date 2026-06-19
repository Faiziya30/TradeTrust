const express = require("express");
const {
  getProfile,
  updateBooster,
  getScoreDetails,
  getInstallments,
  markNotificationRead
} = require("../controllers/customer-controller");
const auth = require("../middleware/auth-middleware");
const { validate } = require('../middleware/validate');
const { updateBoosterSchema, markNotificationReadSchema, getInstallmentsSchema } = require('../validators/customerValidators');

const router = express.Router();

router.get("/:id/profile", auth(), getProfile);
router.get("/:id/score", auth(), getScoreDetails);
router.get("/:id/installments", auth("customer"), validate(getInstallmentsSchema), getInstallments);
router.post("/:id/score", auth(), getScoreDetails); // backward compatibility for existing POST calls
// router.get("/:id/scores", auth(), getScoreHistory);
// router.get("/:id/orders", auth(), getOrders);
// router.get("/:id/notifications", auth(), getNotifications);
router.post(
  "/:id/notifications/:notificationId/read",
  auth(),
  validate(markNotificationReadSchema),
  markNotificationRead
);
// router.get("/:id/installments", auth(), getInstallments);
router.post("/:id/boosters", auth(), validate(updateBoosterSchema), updateBooster);

module.exports = router;
