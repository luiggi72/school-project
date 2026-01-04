const axios = require('axios');

const testDispatch = async () => {
    try {
        const payload = {
            title: 'Test Notification',
            message: 'This is a test message for a specific student.',
            target: {
                type: 'STUDENT',
                value: 'TRNV-43810', // Valid ID from logs
                name: 'TEST STUDENT NAME'
            },
            data: { screen: 'Notifications' }
        };

        console.log('Sending payload:', payload);

        const response = await axios.post('http://localhost:3000/api/notifications/dispatch', payload);
        console.log('Response:', response.data);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testDispatch();
