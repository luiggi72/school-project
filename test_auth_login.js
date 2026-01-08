const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'luis.nachon@hotmail.com',
            password: 'any_password_works_with_bypass'
        });
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.error('Network Error:', error.message);
        }
    }
}

testLogin();
