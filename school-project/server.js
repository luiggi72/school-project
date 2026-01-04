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

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/concepts', conceptsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/school-info', schoolRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/administrative', administrativeRoutes);
app.use('/api/config', configRoutes); // Config routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/medical', require('./routes/medical')); // Medical routes
app.use('/api/notifications', require('./routes/notifications')); // Notifications routes
app.use('/api/chat', require('./routes/chat')); // Chat routes


// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
