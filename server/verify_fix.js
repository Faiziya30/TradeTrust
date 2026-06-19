const jwt = require('jsonwebtoken');
const http = require('http');

const SECRET = "devsecret"; 
// Using hardcoded secret as seen in auth-middleware fallback. 
// If .env has a different secret, this will fail. But .env showed MONGO_URI, not JWT_SECRET.

const token = jwt.sign({ customerId: "692f53d46930aa63121c63f0", role: "customer" }, SECRET);

const data = JSON.stringify({
    items: [{ productId: "test-prod", name: "Test Item Verification", price: 100, qty: 1 }],
    amount: 100,
    paymentOption: "pay_now"
    // No merchantId - testing default
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
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
        console.log("Order Response Code:", res.statusCode);
        try {
            const json = JSON.parse(body);
            if(json.order && json.order.merchantId === 'demo-store') {
                console.log("SUCCESS: Order created with merchantId 'demo-store'");
            } else {
                console.log("FAILURE: merchantId is " + (json.order ? json.order.merchantId : "not in response"));
                console.log("Full Response:", body);
            }
        } catch(e) {
            console.log("Error parsing response:", body);
        }
    });
});

req.on('error', error => {
    console.error("Request error:", error);
});

req.write(data);
req.end();
