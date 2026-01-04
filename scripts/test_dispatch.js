const fetch = require('node-fetch');

async function testDispatch() {
    try {
        const response = await fetch('http://localhost:3000/api/notifications/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Notificación Web Test",
                message: "Esta notificación debe aparecer en la web aunque no tenga token.",
                target: { type: "ALL", value: null }, // Should hit user 33
                data: {}
            })
        });

        const result = await response.json();
        console.log('Dispatch Result:', result);

    } catch (e) {
        console.error(e);
    }
}

testDispatch();
