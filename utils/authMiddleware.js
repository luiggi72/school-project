const fs = require('fs');
const path = require('path');

const ROLES_PATH = path.join(__dirname, '../config/roles.json');

const getRoles = () => {
    try {
        const data = fs.readFileSync(ROLES_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading roles.json:', err);
        return {};
    }
};

const normalizeRole = (role) => {
    if (!role) return 'guest';
    const cleanRole = role.toLowerCase().replace(/\s+/g, ''); // remove spaces

    const mapping = {
        'administrador': 'admin',
        'admin': 'admin',
        'director': 'director',
        'controlescolar': 'control_escolar',
        'control_escolar': 'control_escolar',
        'cobranza': 'cobranza',
        'recepcion': 'recepcion',
        'recepción': 'recepcion',
        'tutor': 'tutor'
    };

    return mapping[cleanRole] || 'guest';
};

/**
 * Middleware to verify if the user has the required permission.
 * Reads roles dynamically from roles.json
 */
const verifyPermission = (requiredPermission) => {
    return (req, res, next) => {
        // 1. Get User Role
        // Strategy: First check req.user (from JWT), then fallback to 'x-user-role' header
        let rawRole = req.headers['x-user-role'];

        if (req.user && req.user.role) {
            rawRole = req.user.role;
        }

        const userRole = normalizeRole(rawRole);
        // console.log(`[Permission Check] Required: ${requiredPermission}, User Role: ${userRole} (raw: ${rawRole})`);

        // 2. Validate Role
        const roles = getRoles();
        const roleConfig = roles[userRole];

        console.log(`[AuthDebug] Raw: '${rawRole}', Norm: '${userRole}', Available: ${Object.keys(roles).join(', ')}`);

        if (!roleConfig) {
            console.warn(`Access Denied: Role '${userRole}' (raw: ${rawRole}) not found in configuration.`);
            return res.status(403).json({ error: 'Access Denied: Invalid Role' });
        }

        // 3. Validate Permission
        const permissionsToCheck = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

        const hasPermission = permissionsToCheck.some(p => roleConfig.permissions.includes(p));

        if (hasPermission) {
            next();
        } else {
            console.warn(`[AccesoDenegado] Usuario: ${userRole} | Req: ${req.method} ${req.originalUrl} | Faltante: ${permissionsToCheck.join(' OR ')}`);
            return res.status(403).json({ error: `Acceso denegado: No tienes permiso para realizar esta acción.` });
        }
    };
};

module.exports = { verifyPermission };
