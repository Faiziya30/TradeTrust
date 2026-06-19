const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "merchant" }, "devsecret"); 
// Note: Role should ideally be 'merchant' or 'admin' for performing actions?
// Logic checks are inside performAction? No, it just checks params.
// Wait, middleware auth() checks role if passed. 
// Step 23 route: router.post("/:merchantId/customers/:customerId/action", auth(), performAction);
// auth() with no args just verifies token.

const data = JSON.stringify({
    action: "approve",
    reason: "Debugging action failure"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/merchants/demo-store/customers/692f53d46930aa63121c63f0/action',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Body:", body);
    });
});

req.on('error', error => {
    console.error("Request error:", error);
});

req.write(data);
req.end();
