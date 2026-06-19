const Notification = require("../models/Notification");

async function pushNotification({
  customerId,
  userId,
  title,
  body,
  type = "system",
  metadata = {},
}) {
  if (!customerId && !userId) {
    throw new Error("Notification requires customer or user");
  }
  return Notification.create({
    customerId,
    userId,
    title,
    body,
    type,
    metadata,
  });
}

async function markNotificationRead(notificationId) {
  return Notification.findByIdAndUpdate(notificationId, {
    status: "read",
    readAt: new Date(),
  });
}

module.exports = { pushNotification, markNotificationRead };

