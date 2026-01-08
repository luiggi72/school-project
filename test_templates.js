const axios = require('axios');

async function test() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'luis.nachon@hotmail.com',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Templates
        console.log('Fetching templates...');
        const templatesRes = await axios.get('http://localhost:3000/api/config/templates', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Templates Response:', templatesRes.status);
        console.log('Data:', templatesRes.data);

        // 3. Fetch Specific Template
        console.log('Fetching inquiry_confirmation template...');
        const detailRes = await axios.get('http://localhost:3000/api/config/templates/inquiry_confirmation', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Detail Response:', detailRes.status);
        console.log('Detail Content Length:', detailRes.data.length);


    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

test();
