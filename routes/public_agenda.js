const express = require('express');
const router = express.Router();
const db = require('../config/db').promise();
const { sendEmail } = require('../utils/emailService');
const { loadTemplate } = require('../utils/templateService');
// Optional: If you need Google Calendar sync for public bookings, include it here
// const { google } = require('googleapis'); 
// ... oauth logic if needed, but maybe keep it simple for now or rely on background sync

// GET /api/public/agenda/slots (Reused Logic)
router.get('/slots', async (req, res) => {
    const { date, level } = req.query; // YYYY-MM-DD, level (Maternal, Primaria, etc.)
    if (!date) return res.status(400).json({ error: 'Date required' });

    try {
        // 1. Get Config
        const [configRows] = await db.query('SELECT setting_value FROM agenda_config WHERE setting_key = ?', ['daily_schedule']);
        let config = { days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", duration: 30, max_concurrent: 1 };

        if (configRows.length > 0) {
            let rowVal = configRows[0].setting_value;
            if (typeof rowVal === 'string') {
                try { rowVal = JSON.parse(rowVal); } catch (e) { }
            }
            config = { ...config, ...rowVal };
        }

        if (!Array.isArray(config.days)) config.days = [];

        // 2. Check if Date is a working day
        const dayOfWeek = new Date(date + 'T00:00:00').getDay();
        if (!config.days.includes(dayOfWeek)) {
            return res.json([]);
        }

        // 3. Get Existing Appointments
        // IMPORTANT: We query basic appointment info to calculate availability
        // Use DATE_FORMAT to bypass timezone issues
        const [events] = await db.query(`
            SELECT DATE_FORMAT(start_time, '%H:%i') as time_str FROM appointments 
            WHERE DATE(start_time) = ?`, [date]
        );

        let slots = [];

        // 4. Calculate Current Time in Mexico City for filtering past slots
        const now = new Date();
        const mexicoTimeStr = now.toLocaleString("en-US", { timeZone: "America/Mexico_City" });
        const mexicoDate = new Date(mexicoTimeStr);

        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${mexicoDate.getFullYear()}-${pad(mexicoDate.getMonth() + 1)}-${pad(mexicoDate.getDate())}`;
        const currentMinutes = mexicoDate.getHours() * 60 + mexicoDate.getMinutes();

        if (config.slots && Array.isArray(config.slots) && config.slots.length > 0) {
            slots = config.slots
                .filter(slot => {
                    // Filter by Level logic
                    if (!level) return true; // Show all if no level specified
                    if (!slot.label || slot.label === 'General') return true; // Always show general/unlabeled
                    return slot.label.toLowerCase() === level.toLowerCase();
                })
                .map(slot => {
                    const slotTime = slot.time;
                    const matches = events.filter(e => e.time_str === slotTime).length;

                    let available = Math.max(0, (slot.capacity || 1) - matches);
                    let isPast = false;

                    // Filter Past Slots if Date is Today
                    if (date === todayStr) {
                        const [h, m] = slotTime.split(':').map(Number);
                        const slotMinutes = h * 60 + m;
                        if (slotMinutes <= currentMinutes) {
                            available = 0; // Mark as unavailable
                            isPast = true;
                        }
                    }

                    return {
                        time: slot.time,
                        label: slot.label,
                        available: available,
                        is_past: isPast
                    };
                });
        } else {
            // Fallback (omitted for brevity, assuming config exists)
        }

        res.json(slots);

    } catch (error) {
        console.error('Error fetching public slots:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/public/agenda/book
router.post('/book', async (req, res) => {
    const {
        parent_name,
        email,
        phone,
        child_name,
        grade,
        date,
        time, // "10:00"
        birth_date,
        previous_school,
        marketing_source
    } = req.body;

    // Basic Validation
    if (!parent_name || !email || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Construct Title and Description
        const title = `Cita: ${child_name} (${grade})`;
        let description = `Solicitado por: ${parent_name}\nEmail: ${email}\nTel: ${phone}\nAlumno: ${child_name}\nGrado/Interés: ${grade}`;

        if (birth_date) description += `\nFecha Nacimiento: ${birth_date}`;
        if (previous_school) description += `\nEscuela Procedencia: ${previous_school}`;
        if (marketing_source) description += `\nEnterado por: ${marketing_source}`;

        // Construct Start/End Time
        // Assuming slots are 30 mins or configurable. 
        // For simplicity, we'll default to 30 mins or 1 hour based on config if we fetched it, 
        // but let's just use 1 hour default for the calendar event to be safe or 30m.
        // Let's standard to 30m for now unless we read config.

        const startDateTime = `${date}T${time}:00`;
        // Calculate End Time (simple approach, assume 30m duration)
        // Ideally we read config.duration, but specific logic might be needed.
        // Let's do a quick DB fetch for config duration

        let duration = 30; // default
        try {
            const [rows] = await db.query('SELECT setting_value FROM agenda_config WHERE setting_key = ?', ['daily_schedule']);
            if (rows.length > 0) {
                const conf = JSON.parse(rows[0].setting_value);
                if (conf.duration) duration = parseInt(conf.duration);
            }
        } catch (e) { }

        // Create Date objects but keep them for calculation logic only if needed.
        // For MySQL insertion, we want to force the specific time we received.
        const startDate = new Date(startDateTime);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Helper to get YYYY-MM-DD HH:mm:ss in LOCAL time (the server's local time, or literally just the string)
        const toLocalSqlString = (d) => {
            const pad = (n) => String(n).padStart(2, '0');
            const Y = d.getFullYear();
            const M = pad(d.getMonth() + 1);
            const D = pad(d.getDate());
            const h = pad(d.getHours()); // Local hours
            const m = pad(d.getMinutes());
            const s = pad(d.getSeconds());
            return `${Y}-${M}-${D} ${h}:${m}:${s}`;
        };

        // We specifically want to use the request Date and Time as the literal "Server Time"
        // So start is conceptually `${date} ${time}:00`
        const sqlStart = `${date} ${time}:00`;

        // Parse date parts for manual calculation
        const [year, month, day] = date.split('-').map(Number);

        // End date calculation (Manual to avoid timezone shifts)
        // Parse time bits
        let [h, min] = time.split(':').map(Number);
        // Add duration
        min += duration;
        while (min >= 60) {
            min -= 60;
            h++;
        }
        // If hour overflows 24, we technically move to next day, but simpler to just format HH:MM:SS
        // Assuming simple 30 min slots within same day for now.
        // Ideally use Date object logic but construct string carefully.

        const endD = new Date(year, month - 1, day, h, min, 0); // using parsed y,m,d from earlier to ensure local

        // Re-formatting endD to SQL string
        const pad = (n) => String(n).padStart(2, '0');
        const sqlEnd = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())} ${pad(endD.getHours())}:${pad(endD.getMinutes())}:00`;

        // Insert into appointments
        const [result] = await db.query(
            'INSERT INTO appointments (title, start_time, end_time, description) VALUES (?, ?, ?, ?)',
            [title, sqlStart, sqlEnd, description]
        );

        // Update Inquiries Flag
        try {
            await db.query('UPDATE inquiries SET flag_scheduled = 1 WHERE email = ? AND child_name = ?', [email, child_name]);
            console.log(`Inquiry status updated for ${child_name} (${email})`);
        } catch (updateErr) {
            console.error('Error updating inquiry flag:', updateErr);
        }

        // --- Send Confirmation Email ---
        try {
            // Format nice date: DD-MM-YY
            const [y, m, d] = date.split('-');
            const shortYear = y.substring(2);
            const dateFormatted = `${d}/${m}/${shortYear}`;

            // Format time: 12h AM/PM
            const [hours, minutes] = time.split(':');
            const hVal = parseInt(hours, 10);
            const ampm = hVal >= 12 ? 'PM' : 'AM';
            const h12 = hVal % 12 || 12;
            const timeFormatted = `${h12}:${minutes} ${ampm}`;

            const emailData = {
                parent_name: parent_name,
                child_name: child_name,
                date_str: dateFormatted,
                time_str: timeFormatted,
                grade: grade // e.g. "Primaria" or "1º Primaria"
            };

            const htmlContent = loadTemplate('cita_confirmada', emailData);

            if (htmlContent) {
                await sendEmail(email, 'Confirmación de Cita - Instituto Cultural Terranova',
                    `Estimado ${parent_name}, su cita ha sido confirmada para el ${dateFormatted} a las ${timeFormatted}.`,
                    htmlContent);
                console.log(`Confirmation email sent to ${email}`);
            }
        } catch (mailError) {
            console.error('Error sending confirmation email:', mailError);
            // Don't fail the request, just log it
        }

        res.status(201).json({ success: true, message: 'Cita agendada correctamente', id: result.insertId });
    } catch (error) {
        console.error('Error creating public booking:', error);
        res.status(500).json({ error: 'Error al agendar cita' });
    }
});

// GET /api/public/agenda/availability (For Calendar UI)
router.get('/availability', async (req, res) => {
    const { start, end } = req.query; // YYYY-MM-DD
    if (!start || !end) return res.json([]);

    try {
        // 1. Get Config
        const [configRows] = await db.query('SELECT setting_value FROM agenda_config WHERE setting_key = ?', ['daily_schedule']);
        let config = { days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", duration: 30, max_concurrent: 1 };

        if (configRows.length > 0) {
            let rowVal = configRows[0].setting_value;
            if (typeof rowVal === 'string') {
                try { rowVal = JSON.parse(rowVal); } catch (e) { }
            }
            config = { ...config, ...rowVal };
        }
        if (!Array.isArray(config.days)) config.days = [];

        // 2. Get Appointments in range
        const [events] = await db.query(`
            SELECT start_time FROM appointments 
            WHERE start_time BETWEEN ? AND ?`, [start, end]
        );

        // 3. Calculate Availability per Day
        const availabilityEvents = [];
        const cleanStart = start.split('T')[0];
        const cleanEnd = end.split('T')[0];

        let currentDay = new Date(cleanStart + 'T00:00:00');
        const endDay = new Date(cleanEnd + 'T00:00:00');

        while (currentDay < endDay) {
            const year = currentDay.getFullYear();
            const month = String(currentDay.getMonth() + 1).padStart(2, '0');
            const day = String(currentDay.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const dayOfWeek = currentDay.getDay();

            if (config.days.includes(dayOfWeek)) {
                // Calculate Total Capacity
                let dailyCapacity = 10;

                // Get Current Time for filtering past slots
                const now = new Date();
                const mexicoTimeStr = now.toLocaleString("en-US", { timeZone: "America/Mexico_City" });
                const mexicoDate = new Date(mexicoTimeStr);
                const pad = (n) => String(n).padStart(2, '0');
                const todayStr = `${mexicoDate.getFullYear()}-${pad(mexicoDate.getMonth() + 1)}-${pad(mexicoDate.getDate())}`;
                const currentMinutes = mexicoDate.getHours() * 60 + mexicoDate.getMinutes();

                if (config.slots && Array.isArray(config.slots)) {
                    // Check individual slots availability
                    dailyCapacity = config.slots.reduce((sum, slot) => {
                        let slotCapacity = parseInt(slot.capacity) || 0;

                        // If it's today, check if slot has passed
                        if (dateStr === todayStr) {
                            const [h, m] = slot.time.split(':').map(Number);
                            const slotMinutes = h * 60 + m;
                            if (slotMinutes <= currentMinutes) {
                                slotCapacity = 0; // Past slot contributes 0 capacity
                            }
                        }

                        return sum + slotCapacity;
                    }, 0);
                } else if (config.max_concurrent) {
                    dailyCapacity = config.max_concurrent;
                }

                // Count Bookings
                const dayBookings = events.filter(e => {
                    const eDate = new Date(e.start_time).toISOString().split('T')[0];
                    return eDate === dateStr;
                }).length;

                if (dayBookings < dailyCapacity) {
                    // HAS SPACE -> Green
                    availabilityEvents.push({
                        date: dateStr,
                        status: 'available',
                        available_count: dailyCapacity - dayBookings
                    });
                } else {
                    // FULL -> Red/Gray
                    availabilityEvents.push({
                        date: dateStr,
                        status: 'full',
                        available_count: 0
                    });
                }
            } else {
                // Not working day - maybe explicitly send closed?
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }

        res.json(availabilityEvents);

    } catch (error) {
        console.error('Error public availability:', error);
        res.json([]);
    }
});

module.exports = router;
