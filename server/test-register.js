const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test_new_' + Date.now() + '@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Body:', body);
    if (body.startsWith('<!DOCTYPE')) {
      console.log('Detected HTML response!');
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();
