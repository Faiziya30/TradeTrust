const mongoose = require('mongoose');
const Order = require('./models/Order');
const fs = require('fs');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const orders = await Order.find({}).lean();
        fs.writeFileSync('orders_utf8.json', JSON.stringify(orders, null, 2), 'utf8');
        const logger = require('./middleware/logger');
        logger.info('Written to orders_utf8.json');
    } catch (err) {
        const logger = require('./middleware/logger');
        logger.error({ err }, 'debug_orders error');
    } finally {
        await mongoose.disconnect();
    }
}
run();
