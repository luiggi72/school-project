const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { google } = require('googleapis');

// OAuth2 Client Configuration
// NOTE: Ideally these should be in process.env
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/auth/google/callback'
);

// Helper to get Calendar API client
// For a multi-tenant app, you'd store tokens per user. 
// For this single-tenant school app, we might store a single Global Token or per-session.
// Here we'll implement per-session for simplicity (requires user to login again if server restarts or cookie lost)
// Improve: Store refresh_token in DB (e.g., config table) for persistent access.

// Routes

// 1. Auth: Redirect to Google
router.get('/auth/google', (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Get refresh token
        scope: scopes
    });
    res.redirect(url);
});

// 2. Auth: Callback
router.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store tokens (Basic In-Memory for now, or you could save to DB)
        // Ideally, save to a 'system_config' or user session.
        // For now, we'll just keep it in the variables for this running instance (Not persistent across restarts)
        // NOTE: This means if server restarts, you must re-auth.
        global.googleTokens = tokens;

        res.redirect('/?section=agenda-section&status=connected');
    } catch (error) {
        console.error('Error authenticating with Google:', error);
        res.status(500).send('Authentication failed');
    }
});

// 3. GET Appointments (Local DB + Sync Status)
router.get('/', (req, res) => {
    // For now, return local DB events
    // Ideally, we could fetch Google Events here too if synced
    db.query('SELECT * FROM appointments ORDER BY start_time ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Transform for FullCalendar if needed, or do it in frontend
        const events = results.map(row => ({
            id: row.id,
            title: row.title,
            start: row.start_time,
            end: row.end_time,
            description: row.description,
            googleEventId: row.google_event_id,
            // className: row.status === 'cancelled' ? 'fc-event-cancelled' : ''
        }));

        res.json(events);
    });
});

// 4. POST Create Appointment
router.post('/', async (req, res) => {
    const { title, start, end, description } = req.body;

    // 1. Save to Local DB
    const sql = 'INSERT INTO appointments (title, start_time, end_time, description) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, start, end, description], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const appointmentId = result.insertId;

        // 2. Sync to Google Calendar (if authenticated)
        if (global.googleTokens) {
            try {
                oauth2Client.setCredentials(global.googleTokens);
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                const event = {
                    summary: title,
                    description: description,
                    start: { dateTime: new Date(start).toISOString(), timeZone: 'America/Mexico_City' }, // Adjust TZ
                    end: { dateTime: new Date(end).toISOString(), timeZone: 'America/Mexico_City' },
                };

                const googleEvent = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });

                // Update DB with Google Event ID
                db.query('UPDATE appointments SET google_event_id = ? WHERE id = ?',
                    [googleEvent.data.id, appointmentId]);

                console.log('Event created on Google Calendar:', googleEvent.data.htmlLink);
            } catch (googleErr) {
                console.error('Error syncing to Google Calendar:', googleErr);
                // Return success for local creation, but warn about sync?
            }
        }

        res.status(201).json({ id: appointmentId, message: 'Appointment created' });
    });
});

// 5. DELETE Appointment
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Get Google ID first
    db.query('SELECT google_event_id FROM appointments WHERE id = ?', [id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });

        const googleEventId = results[0].google_event_id;

        // Delete from DB
        db.query('DELETE FROM appointments WHERE id = ?', [id], async (deleteErr) => {
            if (deleteErr) return res.status(500).json({ error: deleteErr.message });

            // Delete from Google
            if (global.googleTokens && googleEventId) {
                try {
                    oauth2Client.setCredentials(global.googleTokens);
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                    await calendar.events.delete({
                        calendarId: 'primary',
                        eventId: googleEventId
                    });
                    console.log('Event deleted from Google Calendar');
                } catch (googleErr) {
                    console.error('Error deleting from Google Calendar:', googleErr);
                }
            }

            res.json({ message: 'Deleted' });
        });
    });
});

module.exports = router;
