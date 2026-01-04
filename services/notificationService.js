const { Expo } = require('expo-server-sdk');
const db = require('../config/db');

// Create a new Expo SDK client
const expo = new Expo();

const savePushToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        if (!Expo.isExpoPushToken(token)) {
            console.error(`Push token ${token} is not a valid Expo push token`);
            // We might still want to save it or handle error, but for now reject
            return reject(new Error('Invalid token'));
        }

        const query = 'UPDATE users SET push_token = ? WHERE id = ?';
        db.query(query, [token, userId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const sendPushNotification = async (tokens, title, message, data = {}) => {
    let messages = [];
    for (let token of tokens) {
        if (!Expo.isExpoPushToken(token)) {
            console.error(`Push token ${token} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: token,
            sound: 'default',
            title: title,
            body: message,
            data: data,
            priority: 'high',
            channelId: 'school-alerts', // Updated channel ID
        });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }

    // Ideally, we should check tickets for errors (like DeviceNotRegistered) and clean up DB
    return tickets;
};

// Advanced Dispatch Logic
const dispatchNotification = (target, title, message, data) => {
    return new Promise((resolve, reject) => {
        let query = '';
        let params = [];

        console.log('Dispatching to:', target);

        switch (target.type) {
            case 'ALL':
                query = 'SELECT push_token, id as user_id FROM users';
                break;

            case 'LEVEL':
                // target.value = 'PREESCOLAR', 'PRIMARIA', etc.
                // Join users -> students (via family_id)
                query = `
                    SELECT DISTINCT u.push_token, u.id as user_id
                    FROM users u 
                    JOIN students s ON u.linked_family_id = s.family_id 
                    WHERE s.grade LIKE ?
                `;
                params = [`%${target.value}%`];
                break;

            case 'GROUP':
                // target.value = '3 A', etc.
                query = `
                    SELECT DISTINCT u.push_token, u.id as user_id
                    FROM users u 
                    JOIN students s ON u.linked_family_id = s.family_id 
                    WHERE s.group_name = ?
                `;
                params = [target.value];
                break;

            case 'STUDENT':
                // target.value = student_id
                query = `
                    SELECT DISTINCT u.push_token, u.id as user_id
                    FROM users u 
                    JOIN students s ON u.linked_family_id = s.family_id 
                    WHERE s.id = ?
                `;
                params = [target.value];
                break;

            default:
                return reject(new Error('Invalid target type'));
        }

        db.query(query, params, async (err, results) => {
            if (err) return reject(err);

            // Filter for valid tokens only for Push
            const tokens = results
                .map(r => r.push_token)
                .filter(t => t && t !== '' && Expo.isExpoPushToken(t));

            const userIds = results.map(r => r.user_id);

            if (userIds.length === 0) {
                return resolve({ count: 0, message: 'No users found for this target.' });
            }

            // Persist notifications first (or in parallel)
            // Determine category from target
            let category = 'GENERAL';
            if (target.type === 'LEVEL') category = `LEVEL:${target.value}`;
            else if (target.type === 'GROUP') category = `GROUP:${target.value}`;
            else if (target.type === 'STUDENT') {
                // Check if a student name was provided in the target object
                category = target.name ? `STUDENT:${target.name}` : 'PERSONAL';

                // Prepend Student Name to Title for personalization - REMOVED per user request
                // if (target.name) {
                //    title = `${target.name} - ${title}`;
                // }
            }

            // Bulk Insert for Web Notifications (All Users)
            if (userIds.length > 0) {
                const values = userIds.map(uid => [uid, title, message, category, 0]); // 0 = is_read
                const insertQuery = 'INSERT INTO user_notifications (user_id, title, message, category, is_read) VALUES ?';
                db.query(insertQuery, [values], (err) => {
                    if (err) console.error('Error persisting notifications:', err);
                    else console.log(`Persisted ${userIds.length} notifications.`);
                });
            }

            try {
                // Only attempt push if there are tokens
                let tickets = [];
                if (tokens.length > 0) {
                    tickets = await sendPushNotification(tokens, title, message, data);
                }
                resolve({ count: userIds.length, pushCount: tokens.length, tickets });
            } catch (sendError) {
                // Don't fail the whole request if push fails, as web notifs are saved
                console.error('Push send error:', sendError);
                resolve({ count: userIds.length, pushCount: tokens.length, error: 'Push failed but saved to DB' });
            }
        });
    });
};

module.exports = {
    savePushToken,
    dispatchNotification
};
