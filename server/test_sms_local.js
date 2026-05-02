const { sendSMS } = require('./utils/sms');
require('dotenv').config();

async function test() {
    console.log('Testing SMS locally...');
    const result = await sendSMS('8704257125', '123456'); // Using a test number
    console.log('Result:', JSON.stringify(result, null, 2));
}

test();
