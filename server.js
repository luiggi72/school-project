require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health Check
app.get('/api/ping', (req, res) => {
    res.send('pong');
});

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const paymentsRoutes = require('./routes/payments'); // Added payments route import
const conceptsRoutes = require('./routes/concepts'); // Added concepts route import
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/school');
const reportsRoutes = require('./routes/reports');
const inquiriesRoutes = require('./routes/inquiries');
const academicRoutes = require('./routes/academic'); // Added academic routes
const administrativeRoutes = require('./routes/administrative'); // Added administrative routes
const configRoutes = require('./routes/config'); // Added config routes
const calendarRoutes = require('./routes/calendar'); // Added calendar routes
const attachmentsRoutes = require('./routes/attachments'); // Smart Attachments

const checkAuth = require('./middleware/auth'); // Import Middleware

app.use('/api/auth', authRoutes); // Public (Login)

// Protected Routes
app.use('/api/students', checkAuth, studentRoutes);
app.use('/api/payments', checkAuth, paymentsRoutes);
app.use('/api/concepts', checkAuth, conceptsRoutes);
app.use('/api/users', checkAuth, userRoutes);
app.use('/api/school-info', checkAuth, schoolRoutes);
app.use('/api/reports', checkAuth, reportsRoutes);
app.use('/api/inquiries', inquiriesRoutes); // Public POST, Protected others
app.use('/api/academic', checkAuth, academicRoutes);
app.use('/api/administrative', checkAuth, administrativeRoutes);
app.use('/api/config', checkAuth, configRoutes);
app.use('/api/calendar', checkAuth, calendarRoutes);
app.use('/api/agenda', checkAuth, require('./routes/agenda'));
app.use('/api/medical', checkAuth, require('./routes/medical'));
app.use('/api/notifications', checkAuth, require('./routes/notifications'));
app.use('/api/chat', checkAuth, require('./routes/chat'));
app.use('/api/attachments', checkAuth, attachmentsRoutes);
app.use('/api/public/agenda', require('./routes/public_agenda')); // Public Access



// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} and http://192.168.100.3:${PORT}`);
});

// Force Restart Triggered: 2026-01-08T16:05:00
