const https = require('https');
const fs = require('fs');
const path = require('path');

// Robust .env parser
const envContent = fs.readFileSync(path.join(__dirname, '../server/.env'), 'utf8');
const lines = envContent.split(/\r?\n/);
let API_KEY = null;

for (const line of lines) {
    if (line.includes('FAST2SMS_API_KEY')) {
        const parts = line.split('=');
        if (parts.length > 1) {
            API_KEY = parts[1].trim().replace(/['"]/g, '');
        }
    }
}

const testFast2SMS = () => {
    if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
        console.log('❌ Error: FAST2SMS_API_KEY is not set correctly in your server/.env file.');
        return;
    }

    console.log(`🔍 Testing API Key: [${API_KEY.substring(0, 5)}...]`);

    const options = {
        hostname: 'www.fast2sms.com',
        path: '/dev/wallet',
        method: 'GET',
        headers: {
            'authorization': API_KEY,
            'user-agent': 'Mozilla/5.0'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.status === true) {
                    console.log('✅ SUCCESS! Your Fast2SMS API Key is working.');
                    console.log(`💰 Current Wallet Balance: ₹${result.wallet}`);
                } else {
                    console.log(`❌ API Error: ${result.message || 'Invalid Response'}`);
                    console.log('Full Response:', data);
                }
            } catch (e) {
                console.log('❌ Error parsing response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Connection Error:', e.message);
    });

    req.end();
};

testFast2SMS();
