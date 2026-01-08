// Role Definitions and Permissions

const PERMISSIONS = {
    // Users & System
    MANAGE_USERS: 'config.roles',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',

    // Students & Academic
    VIEW_STUDENTS: 'alumnos.list',
    MANAGE_STUDENTS: 'alumnos.list', // Using list permission for management for now
    STUDENTS_EDIT: 'alumnos.edit',
    STUDENTS_DELETE: 'alumnos.delete',

    MANAGE_ACADEMIC: 'school.structure_academic', // Matches roles.json

    // Payments & Finance
    VIEW_PAYMENTS: 'caja.pagos',
    MANAGE_PAYMENTS: 'caja.pagos',
    VIEW_REPORTS: 'reports.income',

    // Inquiries (Informes)
    MANAGE_INQUIRIES: 'inquiries.list', // View list, edit status
    VIEW_AGENDA: 'inquiries.agenda', // View Agenda

    // School Config (Smart Attachments, Templates)
    MANAGE_SCHOOL: 'config.school'
};

const ROLES = {
    admin: {
        name: 'Administrador',
        permissions: Object.values(PERMISSIONS) // All permissions
    },
    director: {
        name: 'Director',
        permissions: [
            PERMISSIONS.VIEW_STUDENTS,
            PERMISSIONS.STUDENTS_EDIT, // Director can edit
            PERMISSIONS.VIEW_PAYMENTS,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.MANAGE_INQUIRIES,
            PERMISSIONS.VIEW_AGENDA
        ]
    },
    control_escolar: {
        name: 'Control Escolar',
        permissions: [
            PERMISSIONS.VIEW_STUDENTS,
            PERMISSIONS.MANAGE_STUDENTS,
            PERMISSIONS.STUDENTS_EDIT, // Control Escolar can edit
            PERMISSIONS.MANAGE_ACADEMIC,
            PERMISSIONS.MANAGE_INQUIRIES,
            PERMISSIONS.VIEW_AGENDA
        ]
    },
    cobranza: {
        name: 'Cobranza',
        permissions: [
            PERMISSIONS.VIEW_STUDENTS, // Needs to see student to charge
            PERMISSIONS.VIEW_PAYMENTS,
            PERMISSIONS.MANAGE_PAYMENTS,
            PERMISSIONS.VIEW_REPORTS
        ]
    },
    recepcion: {
        name: 'Recepción',
        permissions: [
            PERMISSIONS.VIEW_STUDENTS,
            PERMISSIONS.MANAGE_INQUIRIES,
            PERMISSIONS.VIEW_AGENDA
        ]
    }
};

module.exports = {
    ROLES,
    PERMISSIONS
};
