const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "merchant" }, "devsecret"); 
const logger = require('./middleware/logger');
// Note: Role should ideally be 'merchant' or 'admin' for performing actions?
// The dashboard endpoint router uses auth().

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/merchants/demo-store/dashboard',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        logger.info({ status: res.statusCode }, 'Dashboard request status');
        try {
            const json = JSON.parse(body);
            logger.info({ onTimeRate: json.onTimeRate, totalCustomers: json.totalCustomers }, 'Dashboard metrics');
        } catch(e) {
            logger.error({ body }, 'Error parsing dashboard body');
        }
    });
});

req.on('error', error => {
    logger.error({ error }, 'Request error');
});

req.end();
