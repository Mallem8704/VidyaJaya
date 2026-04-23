const https = require('https');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Response Status:", res.statusCode);
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log("Available Models:");
                parsed.models.forEach(m => console.log("- " + m.name));
            } else {
                console.log("No models found or error response:");
                console.log(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log("Raw Response:", data);
        }
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
