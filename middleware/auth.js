const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_12345';

function checkAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader) {
        token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

module.exports = checkAuth;
