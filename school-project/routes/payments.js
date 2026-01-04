const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyPermission } = require('../utils/authMiddleware');
const { PERMISSIONS } = require('../config/permissions');
const banorteService = require('../services/banorteService');

// CODI ROUTES

// Generate CoDi QR
router.post('/codi/qr', verifyPermission(PERMISSIONS.MANAGE_PAYMENTS), async (req, res) => {
    try {
        const { amount, concept, student_id } = req.body;

        // Generate a unique reference
        const reference = `REF-${student_id}-${Date.now()}`;

        const result = await banorteService.generateQr(amount, concept, reference);

        // Ideally, create a pending payment record here
        if (result.success) {
            const items = req.body.items;

            if (items && Array.isArray(items) && items.length > 0) {
                // Bulk Insert for CoDi Items
                const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date, codi_transaction_id, codi_status) VALUES ?';
                const values = items.map(item => [
                    item.student_id || student_id, // Allow item specific ID or fallback
                    item.concept,
                    item.amount,
                    'CoDi',
                    new Date(), // use NOW() equivalent or let DB default? API uses JS Date usually
                    result.transaction_id,
                    'PENDING'
                ]);

                db.query(query, [values], (err, dbResult) => {
                    if (err) {
                        console.error('Error saving pending CoDi items:', err);
                        return res.status(500).json({ error: 'Database error saving payment init' });
                    }
                    res.json(result);
                });

            } else {
                // Single Insert Fallback
                const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date, codi_transaction_id, codi_status) VALUES (?, ?, ?, ?, NOW(), ?, ?)';
                db.query(query, [student_id, concept, amount, 'CoDi', result.transaction_id, 'PENDING'], (err, dbResult) => {
                    if (err) {
                        console.error('Error saving pending CoDi payment:', err);
                        return res.status(500).json({ error: 'Database error saving payment init' });
                    }
                    res.json(result);
                });
            }
        } else {
            res.status(500).json({ error: 'Failed to generate QR' });
        }

    } catch (error) {
        console.error('CoDi Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send CoDi Push Notification (Solicitud de Cobro)
router.post('/codi/request', verifyPermission(PERMISSIONS.MANAGE_PAYMENTS), async (req, res) => {
    try {
        const { amount, concept, student_id, phoneNumber, items } = req.body;

        if (!phoneNumber) return res.status(400).json({ error: 'Phone Number is required' });

        const reference = `REQ-${student_id}-${Date.now()}`;

        const result = await banorteService.sendPaymentRequest(amount, concept, reference, phoneNumber);

        if (result.success) {
            // Save Pending Payment
            if (items && Array.isArray(items) && items.length > 0) {
                const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date, codi_transaction_id, codi_status) VALUES ?';
                const values = items.map(item => [
                    item.student_id || student_id,
                    item.concept,
                    item.amount,
                    'CoDi',
                    new Date(),
                    result.transaction_id,
                    'PENDING'
                ]);

                db.query(query, [values], (err, dbResult) => {
                    if (err) {
                        console.error('Error saving pending CoDi push items:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json(result);
                });
            } else {
                const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date, codi_transaction_id, codi_status) VALUES (?, ?, ?, ?, NOW(), ?, ?)';
                db.query(query, [student_id, concept, amount, 'CoDi', result.transaction_id, 'PENDING'], (err, dbResult) => {
                    if (err) {
                        console.error('Error saving pending CoDi push:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json(result);
                });
            }
        } else {
            res.status(500).json({ error: 'Failed to send CoDi Request' });
        }

    } catch (error) {
        console.error('CoDi Request Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CoDi Webhook (Public endpoint, no auth middleware or specific API key check for now)
router.post('/codi/webhook', async (req, res) => {
    console.log('Received CoDi Webhook:', req.body);
    // Process notification from Banorte
    // This depends heavily on Banorte's actual payload structure

    // Example payload handling
    const { transaction_id, status } = req.body; // Hypothetical fields

    if (transaction_id && status === 'COMPLETED') {
        const query = 'UPDATE payments SET codi_status = ?, payment_date = NOW() WHERE codi_transaction_id = ?';
        db.query(query, ['COMPLETED', transaction_id], (err, result) => {
            if (err) console.error('Error updating payment status:', err);
            else console.log(`Payment ${transaction_id} confirmed.`);
        });
    }

    res.sendStatus(200);
});



// Get payments for a student
router.get('/:studentId', verifyPermission(PERMISSIONS.VIEW_PAYMENTS), (req, res) => {
    const studentId = req.params.studentId;
    const query = 'SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC';

    db.query(query, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get payments for a family (Parents Panel)
router.get('/family/:familyId', (req, res) => { // Removed strict permission check for simplicity in parents panel, or add 'VIEW_OWN_PAYMENTS'
    const familyId = req.params.familyId;

    // Join with students table to filter by family_id
    const query = `
        SELECT p.*, s.name as student_name, s.lastnameP 
        FROM payments p
        JOIN students s ON p.student_id = s.id
        WHERE s.family_id = ?
        ORDER BY p.payment_date DESC
    `;

    db.query(query, [familyId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new payment
// Add a new payment (supports single or bulk)
router.post('/', verifyPermission(PERMISSIONS.MANAGE_PAYMENTS), (req, res) => {
    const { student_id, concept, amount, payment_method, items } = req.body;

    // ENFORCE SERVER DATE: Ignore req.body.payment_date
    const serverDate = new Date(); // Uses server's system time

    console.log('Received Payment Request:', { student_id, itemsCount: items ? items.length : 0 });
    if (items) console.log('Items Preview:', JSON.stringify(items, null, 2));

    if (items && Array.isArray(items) && items.length > 0) {
        // Bulk insert
        const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date) VALUES ?';
        // Use item.student_id if present (family cart)
        const values = items.map(item => {
            const finalStudentId = item.student_id; // STRICT: No fallback to req.body.student_id

            if (!finalStudentId) {
                console.error(`ERROR: Item missing student_id: ${item.concept}`);
            }

            console.log(`Processing Item: ${item.concept} - Assigned Student ID: ${finalStudentId}`);
            return [finalStudentId, item.concept, item.amount, payment_method, serverDate];
        });

        db.query(query, [values], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Payments recorded', count: result.affectedRows });
        });
    } else {
        // Single insert (fallback)
        const query = 'INSERT INTO payments (student_id, concept, amount, payment_method, payment_date) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [student_id, concept, amount, payment_method, serverDate], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Payment recorded', id: result.insertId });
        });
    }
});

module.exports = router;
