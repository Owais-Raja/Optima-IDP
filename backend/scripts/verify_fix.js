const http = require('http');

const data = JSON.stringify({
    name: "Verify Manager",
    email: "verify_mgr_" + Date.now() + "@example.com",
    password: "Password123!",
    role: "manager",
    company: "Optima"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.error("Sending request to port 5000...");

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.error(`STATUS: ${res.statusCode}`);
        console.error(`BODY: ${body}`);
        if (res.statusCode === 201) {
            const user = JSON.parse(body).user;
            if (user.role === 'manager') {
                console.error("VERIFICATION SUCCESS: User created with role 'manager'");
            } else {
                console.error(`VERIFICATION FAILED: User created but role is '${user.role}'`);
            }
        }
    });
});

req.on('error', (error) => {
    console.error("REQUEST ERROR:", error.message);
});

req.write(data);
req.end();
