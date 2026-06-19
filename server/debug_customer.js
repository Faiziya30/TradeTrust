const mongoose = require('mongoose');
const Customer = require('./models/Customer');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const customerId = "692f53d46930aa63121c63f0";
        const customer = await Customer.findById(customerId).lean();
        console.log("Customer found:", customer ? "YES" : "NO");
        if(customer) console.log(JSON.stringify(customer, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
