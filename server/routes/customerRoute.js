const express = require("express");
const {
  getProfile,
  updateBooster,
  getScoreDetails,
  getInstallments,
  markNotificationRead
} = require("../controllers/customer-controller");
const auth = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/:id/profile", auth(), getProfile);
router.get("/:id/score", auth(), getScoreDetails);
router.get("/:id/installments", auth("customer"), getInstallments);
router.post("/:id/score", auth(), getScoreDetails); // backward compatibility for existing POST calls
// router.get("/:id/scores", auth(), getScoreHistory);
// router.get("/:id/orders", auth(), getOrders);
// router.get("/:id/notifications", auth(), getNotifications);
router.post(
  "/:id/notifications/:notificationId/read",
  auth(),
  markNotificationRead
);
// router.get("/:id/installments", auth(), getInstallments);
router.post("/:id/boosters", auth(), updateBooster);

module.exports = router;
