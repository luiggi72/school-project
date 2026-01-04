const axios = require('axios');

const check = async () => {
    try {
        // User 33 was the one from the earlier test
        const response = await axios.get('http://localhost:3000/api/notifications/my-notifications?userId=33');
        const notifs = response.data;

        if (notifs.length > 0) {
            const latest = notifs[0];
            console.log('Latest Notification API Response:');
            console.log(JSON.stringify(latest, null, 2));

            const cat = latest.category;
            console.log(`Category (raw): '${cat}'`);

            if (cat && cat.toUpperCase().includes('STUDENT:')) {
                console.log('Simulation: MATCHES STUDENT:');
            } else {
                console.log('Simulation: DOES NOT MATCH STUDENT:');
            }
        } else {
            console.log('No notifications found for user 33');
        }
    } catch (e) {
        console.error(e);
    }
};

check();
