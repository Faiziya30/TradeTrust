const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "customer" }, "devsecret");
const merchantToken = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "merchant" }, "devsecret");
const logger = require('./middleware/logger');

// Helper to make requests
function makeRequest(opts, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(opts, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if(data) req.write(data);
        req.end();
    });
}

async function run() {
    logger.info('1. Creating order...');
    const orderData = JSON.stringify({
        items: [{ productId: "suspicious-item", name: "Suspicious Item", price: 1000, qty: 1 }],
        amount: 1000,
        paymentOption: "installment",
        installmentConfig: { count: 4 },
        merchantId: "demo-store"
    });
    
    // 1. Create Order (Installment)
    const orderRes = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/orders', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, orderData);
    
    if(!orderRes.body.plan) {
        logger.error({ body: orderRes.body }, "Plan creation failed");
        return;
    }
    const planId = orderRes.body.plan._id;
    logger.info({ planId }, "Plan created");

    // 2. Pay 2 installments rapidly
    logger.info('2. Paying installment 0...');
    await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/installments/${planId}/pay`, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, JSON.stringify({ index: 0 }));

    logger.info('3. Paying installment 1 (should trigger suspicious)...');
    await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/installments/${planId}/pay`, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, JSON.stringify({ index: 1 }));

    // 3. Verify Suspicious Activity
    logger.info('4. Checking Merchant Dashboard for Suspicious Activity...');
    const activityRes = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/merchants/demo-store/suspicious', method: 'GET',
        headers: { 'Authorization': `Bearer ${merchantToken}` }
    });

    const activities = activityRes.body.activities || [];
    const found = activities.find(a => a.type === 'rapid_repayment' && a.details.planId === planId);
    
    if(found) {
        logger.info({ found }, "SUCCESS: Suspicious activity detected!");
    } else {
        logger.warn({ activities }, "FAILURE: No suspicious activity found");
    }
}

run();
