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

const sendPushNotification = async (recipients, title, message, data = {}) => {
    let messages = [];
    for (let recipient of recipients) {
        // Handle both simple token string (legacy) and object {token, badge}
        const token = typeof recipient === 'string' ? recipient : recipient.token;
        const badge = typeof recipient === 'object' ? recipient.badge : undefined;

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
            channelId: 'school-alerts-v2', // Updated channel ID to forced V2
            badge: badge, // Send badge count
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
const dispatchNotification = (target, title, message, data, attachmentUrl = null) => {
    return new Promise((resolve, reject) => {
        let query = '';
        let params = [];

        console.log('Dispatching to:', target);

        switch (target.type) {
            case 'ALL':
                query = `
                     SELECT u.push_token, u.id as user_id,
                     (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id AND un.is_read = 0) as unread_count
                     FROM users u
                 `;
                break;

            case 'LEVEL':
                query = `
                     SELECT DISTINCT u.push_token, u.id as user_id,
                     (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id AND un.is_read = 0) as unread_count
                     FROM users u 
                     JOIN students s ON u.linked_family_id = s.family_id 
                     WHERE s.grade LIKE ?
                 `;
                params = [`%${target.value}%`];
                break;

            case 'GROUP':
                query = `
                     SELECT DISTINCT u.push_token, u.id as user_id,
                     (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id AND un.is_read = 0) as unread_count
                     FROM users u 
                     JOIN students s ON u.linked_family_id = s.family_id 
                     WHERE s.group_name = ?
                 `;
                params = [target.value];
                break;

            case 'STUDENT':
                query = `
                     SELECT DISTINCT u.push_token, u.id as user_id,
                     (SELECT COUNT(*) FROM user_notifications un WHERE un.user_id = u.id AND un.is_read = 0) as unread_count
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

            // Prepare recipients with token and calculated badge (current unread + 1 new)
            const recipients = results
                .filter(r => r.push_token && r.push_token !== '' && Expo.isExpoPushToken(r.push_token))
                .map(r => ({
                    token: r.push_token,
                    badge: (r.unread_count || 0) + 1
                }));

            const userIds = results.map(r => r.user_id);

            if (userIds.length === 0) {
                return resolve({ count: 0, message: 'No users found for this target.' });
            }

            // 135  Determine category from target
            let category = 'GENERAL';
            if (target.type === 'LEVEL') category = `LEVEL:${target.value}`;
            else if (target.type === 'GROUP') category = `GROUP:${target.value}`;
            else if (target.type === 'STUDENT') {
                category = target.name ? `STUDENT:${target.name}` : 'PERSONAL';
            }

            // Generate Batch ID (simple timestamp-random based for compatibility, or UUID)
            const crypto = require('crypto');
            const batchId = crypto.randomUUID();

            // Bulk Insert for Web Notifications (All Users)
            if (userIds.length > 0) {
                // Modified to include batchId
                const values = userIds.map(uid => [uid, title, message, category, 0, attachmentUrl, batchId]);
                const insertQuery = 'INSERT INTO user_notifications (user_id, title, message, category, is_read, attachment_url, batch_id) VALUES ?';
                db.query(insertQuery, [values], (err) => {
                    if (err) console.error('Error persisting notifications:', err);
                    else console.log(`Persisted ${userIds.length} notifications with Batch ID: ${batchId}`);
                });
            }

            try {
                // Only attempt push if there are tokens
                let tickets = [];
                if (recipients.length > 0) {
                    tickets = await sendPushNotification(recipients, title, message, data);
                }
                resolve({ count: userIds.length, pushCount: recipients.length, tickets });
            } catch (sendError) {
                console.error('Push send error:', sendError);
                resolve({ count: userIds.length, pushCount: recipients.length, error: 'Push failed but saved to DB' });
            }
        });
    });
};

module.exports = {
    savePushToken,
    dispatchNotification
};
