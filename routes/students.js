const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyPermission } = require('../utils/authMiddleware');
const { PERMISSIONS } = require('../config/permissions');

// Get all students (optionally filtered by family_id)
// Allow if user can VIEW_STUDENTS ("Alumnos") OR VIEW_PAYMENTS ("Caja")
router.get('/', verifyPermission([PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.VIEW_PAYMENTS]), (req, res) => {
    const { family_id } = req.query;
    let query = `
        SELECT s.*, 
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE student_id = s.id AND codi_status = 'PENDING') as pending_balance
        FROM students s
    `;
    let params = [];

    if (family_id) {
        query += ' WHERE s.family_id = ?';
        params.push(family_id);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /meta/grades - Get unique grades list (Source: academic_levels)
router.get('/meta/grades', verifyPermission([PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.MANAGE_SCHOOL, PERMISSIONS.VIEW_PAYMENTS]), (req, res) => {
    console.log('[API] Hit /students/meta/grades endpoint');
    const query = 'SELECT * FROM academic_levels ORDER BY id ASC'; // Guessing 'id' for order
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching grades:', err);
            // Fallback to students table if academic_levels fails? 
            // Better to return empty or error. User said 'base es academic_levels'.
            return res.status(500).json({ error: 'Database error fetching grades' });
        }
        // Map to array of strings (handle 'name', 'level', or 'description')
        const grades = results.map(r => r.name || r.level || r.description || r.grade).filter(g => g);
        res.json(grades);
    });
});

// Get single student profile with parents
router.get('/:id', verifyPermission([PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.VIEW_PAYMENTS]), (req, res) => {
    const studentId = req.params.id;
    console.log(`[API] Hit /students/${studentId} endpoint`);

    // 1. Get Student Details
    const studentQuery = 'SELECT * FROM students WHERE id = ?';
    db.query(studentQuery, [studentId], (err, studentResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (studentResults.length === 0) return res.status(404).json({ error: 'Student not found' });

        const student = studentResults[0];

        // 2. Get Parents
        const parentsQuery = 'SELECT * FROM student_parents WHERE student_id = ?';
        db.query(parentsQuery, [studentId], (err, parentResults) => {
            if (err) return res.status(500).json({ error: err.message });

            // Combine data
            const responseData = {
                ...student,
                parents: parentResults
            };
            console.log(`[Profile API] Sending data for ${studentId}:`, responseData);
            res.json(responseData);
        });
    });
});

// Add student
router.post('/', verifyPermission(PERMISSIONS.MANAGE_STUDENTS), (req, res) => {
    const { id, name, lastnameP, lastnameM, grade, subgrade, group, unique_id, birthdate, curp, gender, family_id: providedFamilyId } = req.body;

    // Generate Family ID if not provided
    // Format: FAM-XXXXX (5 random alphanumeric characters)
    const generateFamilyId = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = 'FAM-';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Generate Student ID (TRNV-XXXXX) - Digits Only
    const generateStudentId = () => {
        const chars = '0123456789'; // Numbers only
        let result = 'TRNV-';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Ensure unique_id is provided or generate it
    // Note: If id is provided, we use it. If not, we MUST generate it as DB is VARCHAR(20) PK not AUTO_INCREMENT.
    const studentId = id || generateStudentId();

    // Unify ID: If unique_id not provided, use studentId
    const finalUniqueId = unique_id || studentId;

    // Convert empty date to NULL
    const birthdateValue = birthdate === '' ? null : birthdate;

    const familyId = providedFamilyId || generateFamilyId();

    const query = 'INSERT INTO students (id, name, lastnameP, lastnameM, grade, subgrade, group_name, unique_id, birthdate, curp, gender, family_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [studentId, name, lastnameP, lastnameM, grade, subgrade, group, finalUniqueId, birthdateValue, curp, gender, familyId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Student created', id: studentId, family_id: familyId });
    });
});

// Update student
router.put('/:id', verifyPermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res) => {
    const studentId = req.params.id;
    const { name, lastnameP, lastnameM, grade, subgrade, group, unique_id, birthdate, curp, gender } = req.body;

    // We update everything except ID (PK)
    const birthdateValue = birthdate === '' ? null : birthdate;

    const query = 'UPDATE students SET name=?, lastnameP=?, lastnameM=?, grade=?, subgrade=?, group_name=?, unique_id=?, birthdate=?, curp=?, gender=? WHERE id=?';

    try {
        await db.promise().query(query, [name, lastnameP, lastnameM, grade, subgrade, group, unique_id, birthdateValue, curp, gender, studentId]);

        // Logic: If updating Academic Info (Grade/Group), Trigger Parent Credential Email
        if (grade && subgrade && group) { // Only if all 3 are present/assigned
            console.log(`[Student Update] Academic info assigned for ${studentId}. Checking parent credentials...`);

            // 1. Fetch Parents
            const [parents] = await db.promise().query('SELECT * FROM student_parents WHERE student_id = ?', [studentId]);

            for (const parent of parents) {
                if (parent.email) {
                    // 2. Check if user exists
                    const [users] = await db.promise().query('SELECT id FROM users WHERE email = ?', [parent.email]);

                    if (users.length === 0) {
                        console.log(`[Student Update] Creating missing user for parent: ${parent.email}`);

                        // 3. Generate Credentials
                        const passwordRaw = Math.random().toString(36).slice(-8);
                        const username = parent.email;

                        // 4. Create User
                        // Need family_id. Parent record has it.
                        const familyId = parent.family_id;

                        await db.promise().query(
                            'INSERT INTO users (username, email, password, role, profile, linked_family_id) VALUES (?, ?, ?, ?, ?, ?)',
                            [username, parent.email, passwordRaw, 'tutor', 'Padre de Familia', familyId]
                        );

                        // 5. Send Welcome Email
                        console.log(`[Student Update] Sending welcome email to: ${parent.email}`);
                        await sendParentWelcomeEmail(parent.email, username, passwordRaw, { grade, group, subgrade });
                    } else {
                        console.log(`[Student Update] User already exists for ${parent.email}. No email sent.`);
                    }
                }
            }
        }

        res.json({ message: 'Student updated' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// Get student parents
router.get('/:id/parents', verifyPermission(PERMISSIONS.VIEW_STUDENTS), (req, res) => {
    const query = 'SELECT * FROM student_parents WHERE student_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const { sendParentWelcomeEmail } = require('../utils/emailService');

// Update/Create student parent
router.post('/:id/parents', verifyPermission(PERMISSIONS.MANAGE_STUDENTS), async (req, res) => {
    const studentId = req.params.id;
    const { type, name, lastnameP, lastnameM, birthdate, phone, email, street, exterior_number, neighborhood, zip_code, city, state, country } = req.body;

    const [students] = await db.promise().query('SELECT family_id FROM students WHERE id = ?', [studentId]);
    const familyId = (students.length > 0) ? students[0].family_id : null;

    const query = `
            INSERT INTO student_parents 
            (student_id, type, name, lastnameP, lastnameM, birthdate, phone, email, street, exterior_number, neighborhood, zip_code, city, state, country, family_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name=?, lastnameP=?, lastnameM=?, birthdate=?, phone=?, email=?, street=?, exterior_number=?, neighborhood=?, zip_code=?, city=?, state=?, country=?, family_id=?
        `;

    const params = [
        studentId, type, name, lastnameP, lastnameM, birthdate, phone, email, street, exterior_number, neighborhood, zip_code, city, state, country, familyId,
        name, lastnameP, lastnameM, birthdate, phone, email, street, exterior_number, neighborhood, zip_code, city, state, country, familyId
    ];

    db.query(query, params, async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // NOTE: Auto-onboarding logic moved to PUT /students (Edit Student) 
        // when Grade/Group is assigned.

        res.json({ message: 'Parent info updated' });
    });
});

// Delete student (existing)
router.delete('/:id', verifyPermission(PERMISSIONS.MANAGE_STUDENTS), (req, res) => {
    db.query('DELETE FROM students WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student deleted' });
    });
});

// Get student grades
router.get('/:id/grades', verifyPermission(PERMISSIONS.VIEW_STUDENTS), (req, res) => {
    const studentId = req.params.id;
    const query = 'SELECT * FROM student_scores WHERE student_id = ? ORDER BY period, subject';

    db.query(query, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get student tasks (homework)
router.get('/:id/tasks', verifyPermission(PERMISSIONS.VIEW_STUDENTS), (req, res) => {
    const studentId = req.params.id;
    console.log(`[Tasks API] Fetching tasks for student: ${studentId}`);

    const query = 'SELECT * FROM student_tasks WHERE student_id = ? ORDER BY due_date ASC';

    db.query(query, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
