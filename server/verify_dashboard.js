const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "merchant" }, "devsecret"); 
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
        console.log("Status:", res.statusCode);
        try {
            const json = JSON.parse(body);
            console.log("onTimeRate:", json.onTimeRate);
            console.log("totalCustomers:", json.totalCustomers);
        } catch(e) {
            console.log("Body:", body);
        }
    });
});

req.on('error', error => {
    console.error("Request error:", error);
});

req.end();
