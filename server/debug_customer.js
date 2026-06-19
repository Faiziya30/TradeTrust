const mongoose = require('mongoose');
const Customer = require('./models/Customer');
require('dotenv').config();

async function run() {
    try {
            await mongoose.connect(process.env.MONGO_URI);
            const logger = require('./middleware/logger');
            const customerId = "692f53d46930aa63121c63f0";
            const customer = await Customer.findById(customerId).lean();
            logger.info({ found: !!customer }, 'Customer found');
            if(customer) logger.debug({ customer: JSON.stringify(customer, null, 2) }, 'Customer dump');
    } catch (err) {
        const logger = require('./middleware/logger');
        logger.error({ err }, 'debug_customer error');
    } finally {
        await mongoose.disconnect();
    }
}
run();
