const { createOrder } = require("../services/orderService");
const logger = require("../middleware/logger");

const handleOrder = async (req, res) => {
  try {
    const result = await createOrder({ user: req.user, body: req.body });
    return res.json({ success: true, ...result });
  } catch (e) {
    logger.error({ err: e.message || e }, 'Order create error');
    if (e.status) return res.status(e.status).json({ message: e.message });
    res.status(500).json({ message: "Order creation failed" });
  }
};

module.exports = handleOrder;
