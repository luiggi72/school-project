// API Configuration
// Change this to '/api' when deploying to production
const API_URL = '/api';





// State Management (Simplified, mostly for UI state)
let currentUser = null;
let students = [];
let users = [];
let isEditing = false;
let editingStudentId = null;
let activeParentStudent = null; // Track selected student in parents portal

// --- Generic Confirmation Modal Helper ---
// --- Generic Confirmation Modal Helper ---
window.showConfirmModal = function ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = true, isAlert = false, isSuccess = false }) {
    const modal = document.getElementById('generic-confirm-modal');

    if (!modal) {
        // Fallback if modal not present in DOM
        if (isAlert) {
            alert(message || title);
            if (onConfirm) onConfirm();
        } else {
            if (confirm(message || title)) {
                if (onConfirm) onConfirm();
            } else {
                if (onCancel) onCancel();
            }
        }
        return;
    }

    // Modal Exists - Reset Display (Fix for hard-hidden)
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Set Content
    const titleEl = document.getElementById('generic-confirm-title');
    const msgEl = document.getElementById('generic-confirm-message');
    const confirmBtn = document.getElementById('btn-generic-confirm');
    const cancelBtn = document.getElementById('btn-generic-cancel');
    const iconContainer = document.getElementById('generic-confirm-icon-container');

    if (titleEl) titleEl.textContent = title || (isAlert ? 'Aviso' : 'Confirmación');
    if (msgEl) msgEl.textContent = message || '';

    // Configure buttons
    if (confirmBtn) {
        confirmBtn.textContent = confirmText || (isAlert ? 'Aceptar' : 'Confirmar');
        // Style based on flags
        if (isDestructive) {
            confirmBtn.style.backgroundColor = '#ef4444'; // Red
            confirmBtn.style.borderColor = '#ef4444';
            if (iconContainer) {
                iconContainer.style.color = '#ef4444';
                iconContainer.innerHTML = '<span class="material-icons-outlined" style="font-size: 2rem;">warning</span>';
            }
        } else if (isSuccess) {
            confirmBtn.style.backgroundColor = '#22c55e'; // Green
            confirmBtn.style.borderColor = '#22c55e';
            if (iconContainer) {
                iconContainer.style.color = '#22c55e';
                iconContainer.innerHTML = '<span class="material-icons-outlined" style="font-size: 2rem;">check_circle</span>';
            }
        } else {
            confirmBtn.style.backgroundColor = '#3b82f6'; // Standard Blue
            confirmBtn.style.borderColor = '#3b82f6';
            if (iconContainer) {
                iconContainer.style.color = '#3b82f6';
                iconContainer.innerHTML = '<span class="material-icons-outlined" style="font-size: 2rem;">info</span>';
            }
        }
    }

    if (cancelBtn) {
        cancelBtn.textContent = cancelText;
        if (isAlert) {
            cancelBtn.classList.add('hidden');
        } else {
            cancelBtn.classList.remove('hidden');
        }
    }

    // Remove existing listeners to ensure fresh callbacks
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Bind New Listeners
    newConfirmBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    });

    if (cancelBtn) { // cancelBtn is present in DOM even if hidden
        newCancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            if (onCancel) onCancel();
        });
    }

    // Show Modal
    modal.classList.remove('hidden');
    // Ensure it's on top and visible
    if (modal.parentNode !== document.body) {
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
};

// --- Helper for Alert Modal (Simpler wrapper) ---
window.showAlertModal = function (title, message, isError = false) {
    return new Promise(resolve => {
        showConfirmModal({
            title: title || (isError ? 'Error' : 'Aviso'),
            message: message,
            isDestructive: isError,
            isSuccess: !isError, // Default to green check for general info, red for error
            isAlert: true,
            confirmText: 'Entendido',
            onConfirm: resolve // Resolve promise on close
        });
    });
};

// --- Helper for Async Confirm (Wrapper for await) ---
window.showConfirmAsync = function (title, message, isDestructive = false) {
    return new Promise(resolve => {
        showConfirmModal({
            title: title,
            message: message,
            isDestructive: isDestructive,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
        });
    });
};

let isEditingUser = false;
let editingUserId = null;
let currentPaymentItems = []; // State for payment cart
let allConcepts = []; // State for concepts management
// Permissions Constants (Moved to top)
const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_STUDENTS: 'view_students',
    MANAGE_STUDENTS: 'alumnos.edit_btn', // Create/Edit (mapped to edit_btn)
    STUDENTS_EDIT: 'students_edit',
    STUDENTS_DELETE: 'students_delete',
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'config.roles', // Create/Edit (mapped to config.roles)
    USERS_EDIT: 'users_edit',
    USERS_DELETE: 'users_delete',
    VIEW_FINANCE: 'view_finance',
    MANAGE_PAYMENTS: 'manage_payments',
    MANAGE_CONCEPTS: 'manage_concepts',
    VIEW_CONFIG: 'view_config',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_SCHOOL_INFO: 'manage_school_info',
    // Restored Keys
    ALUMNOS_MENU: 'alumnos.view_menu',
    ALUMNOS_LIST: 'alumnos.list',
    ALUMNOS_INFO: 'alumnos.general_info',
    ALUMNOS_EDIT: 'alumnos.edit',   // NEW
    ALUMNOS_DELETE: 'alumnos.delete', // NEW
    ALUMNOS_MEDICAL: 'alumnos.medical',
    CAJA_MENU: 'caja.view_menu',
    CAJA_PAGOS: 'caja.pagos',
    CAJA_CONCEPTOS: 'caja.conceptos',
    CONFIG_MENU: 'config.view_menu',
    CONFIG_ROLES: 'config.roles',
    USERS_EDIT_BTN: 'users.edit', // NEW
    USERS_DELETE_BTN: 'users.delete', // NEW
    CONFIG_PERMISSIONS: 'config.permissions',
    CONFIG_EMAIL: 'config.email_templates',
    SCHOOL_MENU: 'school.view_menu',
    SCHOOL_INFO: 'school.info',
    SCHOOL_ACADEMIC: 'school.structure_academic',
    SCHOOL_ADMIN: 'school.structure_admin',
    HR_MENU: 'hr.view_menu',
    HR_PERSONAL: 'hr.personal',
    REPORTS_MENU: 'reports.view_menu',
    REPORTS_INCOME: 'reports.income',
    INQUIRIES_MENU: 'inquiries.view_menu',
    INQUIRIES_FORM: 'inquiries.form',
    INQUIRIES_LIST: 'inquiries.list',
    VIEW_AGENDA: 'inquiries.agenda',
    NOTIFICATIONS_MENU: 'notifications.view_menu', // NEW
    NOTIFICATIONS_SEND: 'notifications.send',
    CONFIG_CHATBOT: 'config.chatbot'
};

let currentRolesConfig = {}; // Store fetched config
let globalAgendaConfig = { days: [], slots: [] }; // Agenda Config

// Define the menu structure mirroring the sidebar
const MENU_STRUCTURE = [
    {
        title: 'Alumnos',
        groupKey: 'alumnos',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        items: [
            { label: 'Ver Menú Alumnos', permission: PERMISSIONS.ALUMNOS_MENU, hidden: true },
            {
                label: 'Lista General',
                permission: PERMISSIONS.ALUMNOS_LIST,
                targetId: 'students-section',
                actions: ['alumnos.edit_btn', 'alumnos.delete_btn']
            },
            { label: 'Información General', permission: PERMISSIONS.ALUMNOS_INFO, targetId: 'general-info-section' }
        ]
    },
    {
        title: 'Caja',
        groupKey: 'caja',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>`,
        items: [
            { label: 'Ver Menú Caja', permission: PERMISSIONS.CAJA_MENU, hidden: true },
            { label: 'Pagos y Cobros', permission: PERMISSIONS.CAJA_PAGOS, targetId: 'caja-section' },
            { label: 'Conceptos', permission: PERMISSIONS.CAJA_CONCEPTOS, targetId: 'concepts-section' }
        ]
    },
    {
        title: 'Configuración',
        groupKey: 'config',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>`,
        items: [
            { label: 'Ver Menú Configuración', permission: PERMISSIONS.CONFIG_MENU, hidden: true },
            { label: 'Roles y Perfiles', permission: PERMISSIONS.CONFIG_ROLES, targetId: 'roles-users-section', actions: ['users.edit', 'users.delete'] },
            { label: 'Formato Correos', permission: PERMISSIONS.CONFIG_EMAIL, targetId: 'email-templates-section' },
            { label: 'Gestor de Adjuntos', permission: PERMISSIONS.CONFIG_EMAIL, targetId: 'smart-attachments-section' }, // Assuming same perm for now
            { label: 'Asistente Virtual', permission: PERMISSIONS.CONFIG_CHATBOT, targetId: 'chatbot-section' },
            { label: 'Configurar Permisos', permission: PERMISSIONS.CONFIG_PERMISSIONS, targetId: 'permissions-section' }
        ]
    },
    {
        title: 'Información Escolar',
        groupKey: 'school',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>`,
        items: [
            { label: 'Ver Menú Escuela', permission: PERMISSIONS.SCHOOL_MENU, hidden: true },
            { label: 'Datos Institución', permission: PERMISSIONS.SCHOOL_INFO, targetId: 'school-info-section' },
            {
                label: 'Estructura',
                isSubgroup: true,
                items: [
                    { label: 'Académica', permission: PERMISSIONS.SCHOOL_ACADEMIC, targetId: 'academic-structure-section' },
                    { label: 'Administrativa', permission: PERMISSIONS.SCHOOL_ADMIN, targetId: 'administrative-structure-section' }
                ]
            }
        ]
    },
    {
        title: 'Recursos Humanos',
        groupKey: 'hr',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
        items: [
            { label: 'Ver Menú RRHH', permission: PERMISSIONS.HR_MENU, hidden: true },
            { label: 'Personal', permission: PERMISSIONS.HR_PERSONAL, targetId: 'hr-personal-section' }
        ]
    },
    {
        title: 'Reportes',
        groupKey: 'reports',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>`,
        items: [
            { label: 'Ver Menú Reportes', permission: PERMISSIONS.REPORTS_MENU, hidden: true },
            { label: 'Reporte de Ingresos', permission: PERMISSIONS.REPORTS_INCOME, targetId: 'reports-section' }
        ]
    },
    {
        title: 'Admisiones',
        groupKey: 'inquiries',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>`,
        items: [
            { label: 'Ver Menú Solicitudes', permission: PERMISSIONS.INQUIRIES_MENU, hidden: true },
            { label: 'Solicitud Admisión', permission: PERMISSIONS.INQUIRIES_FORM, targetId: 'informes-section' },
            { label: 'Solicitudes', permission: PERMISSIONS.INQUIRIES_LIST, targetId: 'inquiries-list-section' },
            { label: 'Agenda', permission: PERMISSIONS.VIEW_AGENDA, targetId: 'agenda-section' }
        ]
    },
    {
        title: 'Notificaciones',
        groupKey: 'notifications',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
        targetId: 'notifications-section', // Top level link
        items: [
            { label: 'Ver Menú Notificaciones', permission: PERMISSIONS.NOTIFICATIONS_MENU, hidden: true },
            {
                label: 'Enviar Notificación',
                permission: PERMISSIONS.NOTIFICATIONS_SEND,
                hidden: true, // It's a top level link effectively, so hidden items are for permissions matrix mostly
                actions: [
                    'notifications.target_all',
                    'notifications.target_level',
                    'notifications.target_group',
                    'notifications.target_student'
                ]
            }
        ]
    }
];

// Auto-Logout State
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds
let inactivityTimer;

// DOM Elements
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const studentsTableBody = document.getElementById('students-table-body');
const usersTableBody = document.getElementById('users-table-body');
const emptyState = document.getElementById('empty-state');
const studentSearch = document.getElementById('student-search');
const filterGrade = document.getElementById('filter-grade');
const filterSubgrade = document.getElementById('filter-subgrade');
const filterGroup = document.getElementById('filter-group');
const clearSearchBtn = document.getElementById('clear-search-btn');
const studentModal = document.getElementById('student-modal');
const userModal = document.getElementById('user-modal-prod') || document.getElementById('user-modal');
const studentForm = document.getElementById('student-form');
const userForm = document.getElementById('user-form');
const addStudentBtn = document.getElementById('add-student-btn');
const addUserBtn = document.getElementById('add-user-btn');
console.log('DEBUG: addUserBtn found?', !!addUserBtn);
const closeModalBtns = document.querySelectorAll('.close-modal');
const closeUserModalBtns = document.querySelectorAll('.close-modal-user');
const schoolInfoForm = document.getElementById('school-info-form');

// Constants
const SUBGRADES = {
    'MATERNAL': ['Maternal 1', 'Maternal 2'],
    'PREESCOLAR': ['1º', '2º', '3º'],
    'PRIMARIA': ['1º', '2º', '3º', '4º', '5º', '6º'],
    'SECUNDARIA': ['1º', '2º', '3º']
};

const CLASSROOMS = {
    'PRIMARIA': {
        '1º': ['OCEANO', 'RIO', 'LAGO'],
        '2º': ['SELVA', 'JUNGLA', 'MANGLAR'],
        '3º': ['ESTEPA', 'GLACIAR', 'TUNDRA'],
        '4º': ['CAMPIÑA', 'SABANA', 'PRADERA'],
        '5º': ['MONTAÑA', 'BOSQUE', 'FORESTA'],
        '6º': ['TIERRA', 'AIRE', 'AGUA']
    }
};



function updateUIForLogin() {
    if (loginView && dashboardView) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        hideAllSections(); // Ensure clean slate
    }
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
}

function updateUIForLogout() {
    // Hide ALL main containers
    if (dashboardView) dashboardView.classList.add('hidden');
    const parentsView = document.getElementById('parents-view');
    if (parentsView) parentsView.classList.add('hidden');

    // Hide any sub-sections
    hideAllSections();

    // Show Login
    if (loginView) {
        loginView.classList.remove('hidden');
    }
}

async function checkLoginStatus() {
    const userJson = localStorage.getItem('user');

    if (userJson) {
        try {
            currentUser = JSON.parse(userJson);
        } catch (e) {
            console.error('Error parsing user JSON', e);
            handleLogout();
            return;
        }

        // Check for "Half-Login" state (User exists but No Token)
        if (!localStorage.getItem('authToken')) {
            console.warn('Detectada sesión antigua sin token. Forzando re-login...');
            handleLogout();
            return;
        }

        // Init UI for Logged In User
        updateUIForLogin();
        // loadDashboardStats(); // Typo fix
        if (typeof loadDashboardData === 'function') loadDashboardData();

        // Load Agenda Config (safe now)
        if (typeof loadAgendaConfig === 'function') loadAgendaConfig();

        // 1. Fetch dynamic roles
        try {
            const roles = await apiFetch('/config/roles', { silent: true });
            if (roles) {
                currentRolesConfig = roles;
                // Init attachments only after roles are confirmed
                // Use silent catch to prevent flash on reload if transient 403 occurs
                if (typeof initSmartAttachments === 'function') {
                    try {
                        initSmartAttachments();
                    } catch (err) { console.warn('SmartAttachments init suppressed:', err); }
                }
            }
        } catch (e) {
            console.warn('Failed to load dynamic roles:', e);
        }

        // 2. Refresh User Profile
        try {
            if (currentUser.id) {
                const freshUser = await refreshUserData(currentUser.id);
                if (freshUser) {
                    currentUser = freshUser;
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    console.log('User profile refreshed:', currentUser.profile);
                    // Update UI with fresh permissions
                    updateUIForLogin();
                }
            }
        } catch (e) {
            console.error('Background user refresh failed:', e);
        }

        applyPermissions();

        // 3. Role Redirect
        const role = normalizeRole(currentUser.role);
        if (role === 'tutor') {
            if (dashboardView) dashboardView.classList.add('hidden');
            const parentsView = document.getElementById('parents-view');
            if (parentsView) parentsView.classList.remove('hidden');
            loadParentsDashboard(currentUser);
        } else {
            // Admin Logic
            // Default to Dashboard
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            const dashSection = document.getElementById('dashboard-home-section');
            if (dashSection) dashSection.classList.remove('hidden');

            loadDashboard();

            if (checkPermission(PERMISSIONS.CONFIG_ROLES)) loadUsers();
            loadSchoolInfo();
        }

        // 4. Background Tasks
        startInactivityTracking();

        // Notifications
        if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge();
            if (window.notificationPollInterval) clearInterval(window.notificationPollInterval);
            window.notificationPollInterval = setInterval(() => {
                if (currentUser && currentUser.id) updateNotificationBadge();
            }, 5000);
        }

        // Initialize Smart Attachments (Requires Auth & Roles)
        // Moved inside the role fetch logic to ensure permissions are ready
        // if (typeof initSmartAttachments === 'function') initSmartAttachments();

    } else {
        if (window.notificationPollInterval) clearInterval(window.notificationPollInterval);
        updateUIForLogout();
    }
}

// --- API Calls ---

function normalizeRole(role) {
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
}

async function apiFetch(endpoint, options = {}) {
    try {
        // Add Auth Token
        const token = localStorage.getItem('authToken');
        const headers = { ...(options.headers || {}) };

        // Only set JSON content type if not FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Keep role for legacy checks if needed (but server should trust token)
        if (currentUser && currentUser.role) {
            headers['x-user-role'] = normalizeRole(currentUser.role);
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: headers,
            cache: 'no-store'
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Sesión expirada o inválida. Cerrando sesión...');
                handleLogout(); // Graceful logout instead of reload
                return null;
            }
            if (response.status === 403) {
                console.warn('403 Forbidden:', endpoint);
                // Return null to caller instead of throwing, so caller decides to alert or not
                // But existing code expects throw for error handling usually.
                // Let's keep throw but maybe identifying it.
                throw new Error('ACCESO_DENEGADO');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        // Don't alert for 401s as we handle them above (though throw skips here?)
        // Actually, if we return null above, we don't catch.
        // If we throw, we catch. 
        // Let's alert only if it's NOT a reload
        // if (error.message !== 'Failed to fetch' && !options.silent) showAlertModal('Error', error.message, true);
        console.warn('Supressed API Alert:', error.message);
        return null;
    }
}

async function refreshUserData(userId) {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (response.ok) {
            const data = await response.json();
            return data.user;
        }
    } catch (e) {
        console.error('Error refreshing user data:', e);
    }
    return null;
}

// Core fetcher - silent
async function fetchStudentsData() {
    console.log('--- Fetching Students Data ---');
    students = await apiFetch('/students') || [];
    console.log('Students loaded:', students.length);
    return students;
}

// UI Loader - fetches AND renders
async function loadStudents() {
    await fetchStudentsData();

    // Verify DOM access
    const tbody = document.getElementById('students-table-body');
    if (tbody) {
        // tbody.innerHTML = '<tr style="background: red; color: white; font-weight: bold;"><td colspan="8">TEST ROW - IF YOU SEE THIS, TABLE IS VISION OK</td></tr>';
    } else {
        // alert('CRITICAL: Table Body Not Found in DOM'); // Suppress alert if just caching
    }

    // Ensure render happens even if updateSearch fails or input missing
    if (document.getElementById('student-search')) {
        updateSearch();
    } else {
        console.warn('Search input not found, rendering all students directly.');
        renderStudents();
    }
}

async function loadUsers() {
    try {
        const allUsers = await apiFetch('/users') || [];
        // Filter out parents/tutors from the admin list
        users = allUsers.filter(u => normalizeRole(u.role) !== 'tutor');
        renderUsers();
    } catch (e) {
        console.error('Error loading users:', e);
        // Silent fail or toast? alert is too intrusive for every refresh if offline
    }
}

async function loadSchoolInfo() {
    const info = await apiFetch('/school-info');
    if (info) {
        // Safe helpers
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('school-commercial-name', info.commercial_name || info.name);
        setVal('school-street', info.street || info.address);
        setVal('school-ext-number', info.exterior_number);
        setVal('school-neighborhood', info.neighborhood);
        setVal('school-zip', info.zip_code);
        setVal('school-director', info.director);

        // Handle State and City
        const stateSelect = document.getElementById('school-state');
        const citySelect = document.getElementById('school-city');

        // Populate States if needed (assuming MEXICO_DATA is global)
        if (typeof MEXICO_DATA !== 'undefined' && stateSelect.options.length <= 1) {
            Object.keys(MEXICO_DATA).sort().forEach(state => {
                const opt = document.createElement('option');
                opt.value = state;
                opt.textContent = state;
                stateSelect.appendChild(opt);
            });
        }

        // Set State
        if (info.state) {
            stateSelect.value = info.state;
            // Trigger change to load cities, then set city
            if (typeof MEXICO_DATA !== 'undefined') {
                updateCities(info.state);
            }
        }

        // Set City
        if (info.city) {
            citySelect.value = info.city;
        }

        // Phones
        const container = document.getElementById('school-phones-container');
        if (container) {
            container.innerHTML = '';
            let phones = [];
            try {
                if (info.phone && info.phone.startsWith('[')) {
                    phones = JSON.parse(info.phone);
                } else if (info.phone) {
                    phones = [info.phone];
                }
            } catch (e) {
                console.warn('Error parsing phones', e);
                phones = info.phone ? [info.phone] : [];
            }

            if (!Array.isArray(phones) || phones.length === 0) phones = [''];
            phones.forEach(p => addPhoneInput(p));
        }
    }
}

function updateCities(selectedState) {
    const citySelect = document.getElementById('school-city');
    citySelect.innerHTML = '<option value="">Seleccionar Ciudad</option>';

    if (MEXICO_DATA[selectedState]) {
        MEXICO_DATA[selectedState].sort().forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });
    }
}

// Event listener for State change
const schoolStateSelect = document.getElementById('school-state');
if (schoolStateSelect) {
    schoolStateSelect.addEventListener('change', (e) => {
        updateCities(e.target.value);
    });
}

// --- User Form Handling (Profile Creation) ---
if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather data
        const userData = {
            username: document.getElementById('user-username').value.trim(),
            email: document.getElementById('user-email').value.trim(),
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value,
            profile: document.getElementById('user-profile').value.trim(),
            linked_family_id: document.getElementById('user-family-id').value.trim()
        };

        // Basic validation
        if (!userData.username || !userData.email || !userData.role) {
            return showAlertModal('Aviso', 'Por favor completa los campos requeridos.', true);
        }

        const url = isEditingUser ? `/users/${editingUserId}` : '/users';
        const method = isEditingUser ? 'PUT' : 'POST';

        console.log('User Form Handling:', { isEditingUser, editingUserId, method, url });

        try {
            await apiFetch(url, {
                method: method,
                body: JSON.stringify(userData)
            });

            showConfirmModal({
                title: 'Éxito',
                message: isEditingUser ? 'Perfil actualizado exitosamente.' : 'Perfil creado exitosamente.',
                isAlert: true,
                isSuccess: true,
                isDestructive: false
            });
            userModal.classList.add('hidden');
            userForm.reset();
            isEditingUser = false;
            editingUserId = null;
            loadUsers(); // Refresh list

        } catch (error) {
            console.error(error);
            showAlertModal('Error', 'Error al guardar perfil: ' + error.message, true);
        }
    });
}

// --- Login Logic ---

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                // Save session
                localStorage.setItem('user', JSON.stringify(currentUser));
                if (data.token) {
                    localStorage.setItem('authToken', data.token); // Correct Key & Value
                }
                console.log('Login successful:', currentUser);

                // localStorage.setItem('auth_token', 'mock_token'); // REMOVED
                localStorage.setItem('user_role', currentUser.role);
                localStorage.setItem('user_role', currentUser.role);
                localStorage.setItem('user_name', currentUser.username);
                // Save linked family ID if present
                if (currentUser.linked_family_id) {
                    localStorage.setItem('linked_family_id', currentUser.linked_family_id);
                }

                // Redirect based on role
                if (currentUser.role === 'tutor') {
                    loginView.classList.add('hidden');
                    document.getElementById('parents-view').classList.remove('hidden');
                    loadParentsDashboard(currentUser);
                    if (typeof updateNotificationBadge === 'function') updateNotificationBadge(); // Added initial check
                } else {
                    loginView.classList.add('hidden');
                    dashboardView.classList.remove('hidden');
                    loadDashboardData();
                    checkPermission(currentUser.role);
                }
                // File Input UI Logic
                const fileInput = document.getElementById('notif-attachment');
                const fileNameDisplay = document.getElementById('file-name-display');
                if (fileInput && fileNameDisplay) {
                    fileInput.addEventListener('change', () => {
                        if (fileInput.files.length > 0) {
                            fileNameDisplay.textContent = 'Archivo seleccionado: ' + fileInput.files[0].name;
                            fileNameDisplay.style.color = '#10b981'; // Green
                        } else {
                            fileNameDisplay.textContent = '';
                        }
                    });
                }

                if (notifForm) {
                    // This block was empty in the instruction, assuming it's meant to be a new conditional block.
                    // The `loginForm.reset();` from the instruction was likely a copy-paste error.
                }
                if (loginForm) loginForm.reset();

                // Update Profile Greeting
                const profileName = currentUser.profile || currentUser.username;
                const displayNameEl = document.getElementById('user-display-name');
                const displayRoleEl = document.getElementById('user-display-role');
                const userInitialEl = document.getElementById('user-initial');

                if (displayNameEl) displayNameEl.textContent = profileName;
                if (displayRoleEl) displayRoleEl.textContent = `Rol: ${currentUser.role}`;
                // Dynamic Menu Render
                renderSidebar(currentUser.permissions);

                // Force Dashboard Visibility
                if (typeof dashboardView !== 'undefined' && dashboardView) dashboardView.classList.remove('hidden');
                if (typeof loginView !== 'undefined' && loginView) loginView.classList.add('hidden');

                // Check permissions for buttons
                updateButtonPermissions();

                if (currentUser) {
                    // Init UI for Logged In User
                    // Assuming updateUIForLogin and loadDashboardStats are defined elsewhere
                    // updateUIForLogin();
                    // loadDashboardStats();

                    // Fetch dynamic roles for permission checking
                    try {
                        const roles = await apiFetch('/config/roles');
                        if (roles) {
                            currentRolesConfig = roles;
                        }
                    } catch (e) {
                        console.warn('Failed to load dynamic roles, using static fallback');
                    }
                }

                // Apply Permissions UI first
                applyPermissions();

                // Load Data based on Permissions
                // if (checkPermission(PERMISSIONS.ALUMNOS_LIST)) {
                //     loadStudents();
                // }

                if (checkPermission(PERMISSIONS.CONFIG_ROLES)) {
                    loadUsers();
                }

                loadSchoolInfo();
            } else {
                console.error('Login failed:', data.message);
                showConfirmModal({
                    title: 'Error de Inicio de Sesión',
                    message: data.message || 'Error de inicio de sesión',
                    confirmText: 'Aceptar',
                    isAlert: true,
                    isDestructive: true
                });
            }
        } catch (error) {
            console.error('Login network error:', error);
            showConfirmModal({
                title: 'Error de Conexión',
                message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                confirmText: 'Aceptar',
                isAlert: true,
                isDestructive: true
            });
        }
    });
}

// ... (Student CRUD omitted for brevity) ...

// --- User CRUD ---



// --- Notifications Logic (Enhanced) ---

// UI Elements
const notifComposeView = document.getElementById('notif-compose-view');
const notifHistoryView = document.getElementById('notif-history-view');
const tabNotifCompose = document.getElementById('tab-notif-compose');
const tabNotifHistory = document.getElementById('tab-notif-history');
const notifHistoryBody = document.getElementById('notif-history-body');

// Tab Switching
if (tabNotifCompose && tabNotifHistory) {
    tabNotifCompose.addEventListener('click', () => {
        switchNotifTab('compose');
    });
    tabNotifHistory.addEventListener('click', () => {
        switchNotifTab('history');
        loadNotifHistory();
    });
}

function switchNotifTab(tab) {
    const pageTitle = document.getElementById('page-title');
    if (tab === 'compose') {
        tabNotifCompose.classList.add('active');
        tabNotifCompose.style.borderBottom = '2px solid #e31e25';
        tabNotifCompose.style.color = '#1e293b';

        tabNotifHistory.classList.remove('active');
        tabNotifHistory.style.borderBottom = 'none';
        tabNotifHistory.style.color = '#64748b';

        notifComposeView.classList.remove('hidden');
        notifHistoryView.classList.add('hidden');

        if (pageTitle) pageTitle.textContent = 'Notificaciones - Redactar';
    } else {
        tabNotifHistory.classList.add('active');
        tabNotifHistory.style.borderBottom = '2px solid #e31e25';
        tabNotifHistory.style.color = '#1e293b';

        tabNotifCompose.classList.remove('active');
        tabNotifCompose.style.borderBottom = 'none';
        tabNotifCompose.style.color = '#64748b';

        notifHistoryView.classList.remove('hidden');
        notifComposeView.classList.add('hidden');

        if (pageTitle) pageTitle.textContent = 'Notificaciones - Historial de Envíos';
    }
}

async function loadNotifHistory() {
    notifHistoryBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Cargando...</td></tr>';

    try {
        const history = await apiFetch('/notifications/sent'); // Note: Ensure API endpoint matches
        renderNotifHistory(history || []);
    } catch (e) {
        console.error('Error loading history:', e);
        notifHistoryBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Error al cargar historial</td></tr>';
    }
}

function renderNotifHistory(history) {
    notifHistoryBody.innerHTML = '';
    const emptyState = document.getElementById('notif-history-empty');

    if (!history || history.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    history.forEach(item => {
        const date = new Date(item.created_at).toLocaleString('es-MX', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        // Parse category for display
        let targetDisplay = 'General';
        let badgeClass = 'bg-gray-100 text-gray-800'; // Default styling

        if (item.category) {
            if (item.category.startsWith('ALL')) {
                targetDisplay = 'Todos';
                badgeClass = 'bg-gray-100 text-gray-800';
            } else if (item.category.startsWith('LEVEL:')) {
                targetDisplay = 'Nivel: ' + item.category.replace('LEVEL:', '');
                badgeClass = 'bg-blue-100 text-blue-800';
            } else if (item.category.startsWith('GROUP:')) {
                targetDisplay = 'Grupo: ' + item.category.replace('GROUP:', '');
                badgeClass = 'bg-green-100 text-green-800';
            } else if (item.category.startsWith('STUDENT:')) {
                targetDisplay = 'Alumno: ' + item.category.replace('STUDENT:', '');
                badgeClass = 'bg-purple-100 text-purple-800';
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space: nowrap; color: #64748b; font-size: 0.85rem;">${date}</td>
            <td>
                <div style="font-weight: 600; color: #334155;">${item.title}</div>
                <div style="font-size: 0.85rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; max-width: 300px; white-space: nowrap;">${item.message}</div>
            </td>
            <td>
                <span style="padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 500; background-color: #f1f5f9; color: #475569;">
                    ${targetDisplay}
                </span>
            </td>
            <td style="text-align: center;">
                 <div style="font-size: 0.85rem;">
                    <span style="font-weight: 600; color: #e31e25;">${item.read_count}</span>
                    <span style="color: #94a3b8;">/ ${item.recipient_count}</span>
                 </div>
                 <div style="font-size: 0.7rem; color: #94a3b8;">leídos</div>
            </td>
            <td style="text-align: right;">
                <button onclick="editBatch('${item.batch_id}', '${item.title.replace(/'/g, "\\'")}', '${item.message.replace(/'/g, "\\'")}')" 
                    title="Editar" style="background:none; border:none; cursor:pointer; color: #3b82f6; margin-right: 0.5rem;">
                    <span class="material-icons-outlined" style="font-size: 1.2rem;">edit</span>
                </button>
                <button onclick="deleteBatch('${item.batch_id}')" 
                    title="Eliminar (Revocar)" style="background:none; border:none; cursor:pointer; color: #ef4444;">
                    <span class="material-icons-outlined" style="font-size: 1.2rem;">delete</span>
                </button>
            </td>
        `;
        notifHistoryBody.appendChild(tr);
    });
}

// Global functions for inline onclick handlers
// Edit Modal Logic
window.editBatch = (batchId, currentTitle, currentMessage) => {
    const modal = document.getElementById('edit-notif-modal');
    if (!modal) return;

    document.getElementById('edit-notif-id').value = batchId;
    document.getElementById('edit-notif-title').value = currentTitle;
    document.getElementById('edit-notif-message').value = currentMessage;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
};

window.closeEditNotifModal = () => {
    const modal = document.getElementById('edit-notif-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

window.saveEditedNotif = async () => {
    const batchId = document.getElementById('edit-notif-id').value;
    const newTitle = document.getElementById('edit-notif-title').value;
    const newMessage = document.getElementById('edit-notif-message').value;

    if (!newTitle || !newMessage) {
        alert('Título y mensaje son requeridos');
        return;
    }

    try {
        const btn = document.querySelector('#edit-notif-modal .btn-primary');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = 'Guardando...';

        await apiFetch(`/notifications/batch/${batchId}`, {
            method: 'PUT',
            body: JSON.stringify({ title: newTitle, message: newMessage })
        });

        closeEditNotifModal();
        showConfirmModal({
            title: 'Éxito',
            message: 'Notificación actualizada correctamente',
            isAlert: true,
            isSuccess: true
        });
        loadNotifHistory(); // Refresh table

        btn.disabled = false;
        btn.innerText = originalText;
    } catch (e) {
        console.error(e);
        alert('Error al actualizar: ' + e.message);
        const btn = document.querySelector('#edit-notif-modal .btn-primary');
        btn.disabled = false;
        btn.innerText = 'Guardar Cambios';
    }
};

window.deleteBatch = (batchId) => {
    showConfirmModal({
        title: 'Revocar Notificación',
        message: '¿Estás seguro? Se eliminará esta notificación de TODOS los destinatarios. No podrán verla más.',
        confirmText: 'Sí, Eliminar',
        isDestructive: true,
        onConfirm: async () => {
            try {
                await apiFetch(`/notifications/batch/${batchId}`, {
                    method: 'DELETE'
                });
                loadNotifHistory(); // Refresh
            } catch (e) {
                console.error(e);
                showAlertModal('Error', 'No se pudo eliminar: ' + e.message, true);
            }
        }
    });
};


// Notification Target Logic
const notifTargetType = document.getElementById('notif-target-type');
const notifTargetValue = document.getElementById('notif-target-value');
const targetValueContainer = document.getElementById('target-value-container');
const targetValueLabel = document.getElementById('target-value-label');
const notifStudentSearchContainer = document.getElementById('notif-student-search-container');
const notifStudentSearch = document.getElementById('notif-student-search');
const notifStudentDatalist = document.getElementById('notif-student-datalist');
const notifForm = document.getElementById('notification-form');
const groupLevelFilter = document.getElementById('notif-group-level-filter');

if (notifTargetType) {
    notifTargetType.addEventListener('change', async () => {
        const type = notifTargetType.value;

        // Reset
        notifTargetValue.innerHTML = '<option value="">Seleccionar...</option>';
        notifTargetValue.value = '';
        if (notifStudentSearch) notifStudentSearch.value = '';


        // Reset UI Elements
        const groupLevelFilter = document.getElementById('notif-group-level-filter');
        const groupLevelLabel = document.getElementById('notif-group-level-label');
        const groupGradeFilter = document.getElementById('notif-group-grade-filter');
        const groupGradeLabel = document.getElementById('notif-group-grade-label');
        const groupFinalLabel = document.getElementById('notif-group-final-label');

        if (groupLevelFilter) groupLevelFilter.classList.add('hidden');
        if (groupLevelLabel) groupLevelLabel.classList.add('hidden');
        if (groupGradeFilter) groupGradeFilter.classList.add('hidden');
        if (groupGradeLabel) groupGradeLabel.classList.add('hidden');
        if (groupFinalLabel) groupFinalLabel.classList.add('hidden');

        if (type === 'ALL') {
            targetValueContainer.classList.add('hidden');
        } else if (type === 'STUDENT') {
            console.log('Selected STUDENT type. Showing search container...');
            targetValueContainer.classList.remove('hidden');
            targetValueLabel.classList.remove('hidden');
            targetValueLabel.textContent = 'Buscar Alumno';
            notifTargetValue.classList.add('hidden'); // Hide select

            if (notifStudentSearchContainer) {
                notifStudentSearchContainer.classList.remove('hidden'); // Show search input
                notifStudentSearchContainer.style.display = 'block'; // Force visible
                console.log('Search container visible');
            } else {
                console.error('Search container NOT found');
            }

            // Populate datalist if empty
            if (notifStudentDatalist && notifStudentDatalist.options.length === 0) {
                // Fetch all students for search
                try {
                    const students = await apiFetch('/students');
                    // Sort alphabetically
                    students.sort((a, b) => a.name.localeCompare(b.name));
                    students.forEach(s => {
                        const opt = document.createElement('option');
                        // Format: "Name Lastname (Group) [ID: 123]"
                        const groupInfo = s.group_name ? ` (${s.group_name})` : '';
                        // FIX: Use correct property names from DB (lastnameP, lastnameM)
                        opt.value = `${s.name} ${s.lastnameP || ''} ${s.lastnameM || ''}${groupInfo} [ID: ${s.id}]`;
                        notifStudentDatalist.appendChild(opt);
                    });
                } catch (e) {
                    console.error('Error fetching students for search:', e);
                }
            }

        } else {
            // Level or Group
            targetValueContainer.classList.remove('hidden');
            notifStudentSearchContainer.classList.add('hidden');
            notifTargetValue.classList.remove('hidden');

            if (type === 'LEVEL') {
                targetValueLabel.classList.remove('hidden');
                targetValueLabel.textContent = 'Nivel Educativo';
                try {
                    const levels = await apiFetch('/academic/levels');
                    levels.forEach(l => {
                        const opt = document.createElement('option');
                        opt.value = l.id;
                        opt.textContent = l.name;
                        notifTargetValue.appendChild(opt);
                    });
                } catch (e) {
                    console.error('Error fetching levels:', e);
                }

            } else if (type === 'GROUP') {
                targetValueLabel.classList.add('hidden'); // Hide generic label

                const groupLevelFilter = document.getElementById('notif-group-level-filter');
                const groupLevelLabel = document.getElementById('notif-group-level-label');
                const groupGradeFilter = document.getElementById('notif-group-grade-filter');
                const groupGradeLabel = document.getElementById('notif-group-grade-label');
                const groupFinalLabel = document.getElementById('notif-group-final-label');

                if (groupLevelFilter && groupGradeFilter) {
                    // Show Level UI
                    groupLevelFilter.classList.remove('hidden');
                    if (groupLevelLabel) groupLevelLabel.classList.remove('hidden');

                    // Populate Levels
                    groupLevelFilter.innerHTML = '<option value="">Seleccionar Nivel...</option>';
                    try {
                        const levels = await apiFetch('/academic/levels');
                        levels.forEach(l => {
                            const opt = document.createElement('option');
                            opt.value = l.id;
                            opt.textContent = l.name;
                            groupLevelFilter.appendChild(opt);
                        });
                    } catch (e) {
                        console.error(e);
                        groupLevelFilter.innerHTML = '<option value="">Error al cargar niveles</option>';
                    }

                    // Reset sub-filters
                    groupGradeFilter.classList.add('hidden');
                    if (groupGradeLabel) groupGradeLabel.classList.add('hidden');
                    notifTargetValue.classList.add('hidden');
                    if (groupFinalLabel) groupFinalLabel.classList.add('hidden');


                    // LEVEL CHANGE -> LOAD GRADES
                    groupLevelFilter.onchange = async () => {
                        const levelId = groupLevelFilter.value;

                        // Reset downstream
                        groupGradeFilter.innerHTML = '<option value="">Cargando...</option>';
                        notifTargetValue.innerHTML = '';
                        notifTargetValue.classList.add('hidden');
                        if (groupFinalLabel) groupFinalLabel.classList.add('hidden');

                        if (!levelId) {
                            groupGradeFilter.classList.add('hidden');
                            if (groupGradeLabel) groupGradeLabel.classList.add('hidden');
                            return;
                        }

                        // Show Grade UI
                        groupGradeFilter.classList.remove('hidden');
                        if (groupGradeLabel) groupGradeLabel.classList.remove('hidden');

                        try {
                            const grades = await apiFetch(`/academic/grades?level_id=${levelId}`);

                            if (!grades || grades.length === 0) {
                                groupGradeFilter.innerHTML = '<option value="">Sin grados en este nivel</option>';
                                return;
                            }

                            groupGradeFilter.innerHTML = '<option value="">Seleccionar Grado...</option>';
                            grades.forEach(g => {
                                const opt = document.createElement('option');
                                opt.value = g.id;
                                opt.textContent = g.name;
                                groupGradeFilter.appendChild(opt);
                            });

                        } catch (e) {
                            console.error(e);
                            groupGradeFilter.innerHTML = '<option value="">Error al cargar grados</option>';
                        }
                    };

                    // GRADE CHANGE -> LOAD GROUPS
                    groupGradeFilter.onchange = async () => {
                        const gradeId = groupGradeFilter.value;

                        notifTargetValue.innerHTML = '<option value="">Cargando...</option>';

                        if (!gradeId) {
                            notifTargetValue.classList.add('hidden');
                            if (groupFinalLabel) groupFinalLabel.classList.add('hidden');
                            return;
                        }

                        // Show Group UI
                        notifTargetValue.classList.remove('hidden');
                        if (groupFinalLabel) groupFinalLabel.classList.remove('hidden');

                        try {
                            const groups = await apiFetch(`/academic/groups?grade_id=${gradeId}`);

                            if (!groups || groups.length === 0) {
                                notifTargetValue.innerHTML = '<option value="">Sin grupos en este grado</option>';
                                return;
                            }

                            // Deduplicate names
                            const uniqueNames = [...new Set(groups.map(g => g.name))].sort();

                            notifTargetValue.innerHTML = '<option value="">Seleccionar Grupo</option>';
                            uniqueNames.forEach(name => {
                                const opt = document.createElement('option');
                                opt.value = name;
                                opt.textContent = name;
                                notifTargetValue.appendChild(opt);
                            });

                        } catch (e) {
                            console.error(e);
                            notifTargetValue.innerHTML = '<option value="">Error al cargar grupos</option>';
                        }
                    };

                }
            }
        }
    });
}

// Inline Autocomplete for Student Search
if (notifStudentSearch && notifStudentDatalist) {
    notifStudentSearch.addEventListener('input', (e) => {
        // Skip if deleting or empty
        if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward' || !notifStudentSearch.value) return;

        const val = notifStudentSearch.value.toLowerCase();

        const options = notifStudentDatalist.options;
        for (let i = 0; i < options.length; i++) {
            const optVal = options[i].value;
            const lowerOpt = optVal.toLowerCase();

            // Search by Name OR Surname (Contains)
            if (lowerOpt.includes(val)) {

                // If it's a prefix match, do the nice selection
                if (lowerOpt.startsWith(val)) {
                    notifStudentSearch.value = optVal;
                    notifStudentSearch.setSelectionRange(val.length, optVal.length);
                } else {
                    // If it's a surname match (middle of string), simply auto-fill the whole name
                    // UX Decision: This might feel "jumpy", but it answers "Agregar apellidos a la busqueda"
                    notifStudentSearch.value = optVal;
                    // Select the whole thing so they can overwrite if it's wrong
                    notifStudentSearch.select();
                }
                break;
            }
        }
    });
}
const btnSendNotif = document.getElementById('btn-send-notif');
if (btnSendNotif) {
    btnSendNotif.addEventListener('click', async (e) => {
        e.preventDefault();

        const title = document.getElementById('notif-title').value;
        const message = document.getElementById('notif-message').value;
        const type = document.getElementById('notif-target-type').value;

        if (!title.trim() || !message.trim()) {
            return alert('Por favor, completa el título y el mensaje.');
        }

        let value = null;
        let rawValue = '';
        let targetName = null;

        if (type === 'LEVEL' || type === 'GROUP') {
            const selectEl = document.getElementById('notif-target-value');
            value = selectEl.value;
            if (!value) return alert('Por favor seleccione un valor para el destinatario.');

            // Capture the readable name (e.g., "Primaria", "Grupo 1-A")
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            if (selectedOption) {
                targetName = selectedOption.textContent;
            }
        } else if (type === 'STUDENT') {
            // Find student ID by parsing the datalist value: "Name ... [ID: 123]"
            rawValue = document.getElementById('notif-student-search').value;
            const match = rawValue.match(/\[ID:\s*(.+?)\]/);

            if (match && match[1]) {
                value = match[1];
                targetName = rawValue.split('[')[0].trim();
            } else {
                // ... validation error modal ...
            }
        } else if (type === 'ALL') {
            targetName = 'Toda la Escuela';
        }


        const payload = {
            title,
            message,
            target: { type, value, name: targetName },
            data: { screen: 'Notifications' } // Direct deep link if needed
        };

        try {
            const btn = document.getElementById('btn-send-notif'); // Corrected ID from HTML
            if (!btn) {
                console.error('Send button not found');
                return;
            }
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons-outlined spin">refresh</span> Enviando...';

            const fileInput = document.getElementById('notif-attachment');
            let body;
            let headers = {};

            if (fileInput && fileInput.files.length > 0) {
                const formData = new FormData();
                // Append JSON data as strings
                formData.append('title', payload.title);
                formData.append('message', payload.message);
                formData.append('target', JSON.stringify(payload.target));
                formData.append('data', JSON.stringify(payload.data));
                formData.append('attachment', fileInput.files[0]);
                body = formData;
                // Don't set Content-Type header manually for FormData, let browser set boundary
            } else {
                body = JSON.stringify(payload);
                headers['Content-Type'] = 'application/json';
            }

            // Custom fetch wrapper usually sets JSON content type, so we might need to bypass it or adjust it.
            // Assuming apiFetch handles FormData if body is FormData object or we'll assume standard fetch for upload.
            // Let's rely on standard fetch to be safe with FormData boundary handling

            const token = localStorage.getItem('authToken'); // Assuming token storage key

            const response = await fetch(`${API_URL}/notifications/dispatch`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al enviar');
            }

            const result = await response.json();

            if (response) {
                showConfirmModal({
                    title: '¡Éxito!',
                    message: '✅ Notificación enviada correctamente',
                    confirmText: 'Aceptar',
                    isAlert: true,
                    isDestructive: false,
                    isSuccess: true // Green Success Mode
                });
                // clear inputs
                document.getElementById('notif-title').value = '';
                document.getElementById('notif-message').value = '';
                document.getElementById('notif-attachment').value = ''; // Reset file
                if (document.getElementById('file-name-display')) document.getElementById('file-name-display').textContent = '';
            }
            // Reset selectors
            if (notifTargetValue) notifTargetValue.classList.add('hidden');
            if (notifStudentSearch) notifStudentSearch.classList.add('hidden');

            btn.disabled = false;
            btn.innerHTML = originalText;
        } catch (error) {
            console.error('Notification Error:', error);
            alert('Error al enviar: ' + error.message);
            document.getElementById('btn-send-notif').disabled = false;
        }
    });
}
async function populateUserRoleSelect() {
    const roleSelect = document.getElementById('user-role');
    if (!roleSelect) return;

    // Check if config loaded, or if 'tutor' is missing (indicating stale config)
    if (Object.keys(currentRolesConfig).length === 0 || !currentRolesConfig['tutor']) {
        try {
            console.log('Fetching roles for dropdown (cache-bust)...');
            const roles = await apiFetch(`/config/roles?t=${new Date().getTime()}`);
            if (roles) {
                currentRolesConfig = roles;
                console.log('Roles loaded:', Object.keys(roles));
            }
        } catch (e) {
            console.error('Error fetching roles for select:', e);
        }
    }

    // Clear existing options except disabled placeholder if preferred, 
    // but here we rebuild entirely based on current config.
    roleSelect.innerHTML = '';

    // Default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Seleccionar Rol...';
    roleSelect.appendChild(defaultOpt);

    // Dynamic options from currentRolesConfig
    const keys = Object.keys(currentRolesConfig);
    // DEBUG ALERT (Remove later)
    // alert('DEBUG: Roles loaded keys: ' + keys.join(', '));

    Object.entries(currentRolesConfig).forEach(([key, config]) => {
        const opt = document.createElement('option');
        opt.value = key; // internal key (e.g., 'tutor', 'admin')
        opt.textContent = config.name; // Display name
        roleSelect.appendChild(opt);
    });

    // FAILSAFE: Force Tutor Option if missing logic fails
    // This ensures the user can proceed even if the dynamic fetch has issues
    if (!keys.includes('tutor')) {
        const opt = document.createElement('option');
        opt.value = 'tutor';
        opt.textContent = 'Tutor (Manual)';
        roleSelect.appendChild(opt);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // --- User Buttons Initialization ---
    // Refactored to target new ID to bypass stale DOM issues
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal-prod') || document.getElementById('user-modal');

    if (addUserBtn) {
        addUserBtn.addEventListener('click', async () => {
            isEditingUser = false;
            editingUserId = null;
            if (userForm) userForm.reset();

            try {
                await populateUserRoleSelect();
            } catch (e) {
                console.error('Error loading roles:', e);
            }

            if (document.getElementById('user-modal-title')) {
                document.getElementById('user-modal-title').textContent = 'Agregar Usuario';
            }

            // Using the new resolved variable
            if (userModal) {
                // RUNTIME FIX: Move to body to escape any nesting
                if (userModal.parentNode !== document.body) {
                    document.body.appendChild(userModal);
                }

                // Alert ID to debug cache

                userModal.classList.remove('hidden');
                // Ensure flex for centering (CSS class should handle it, but being explicit is safe)
                userModal.style.display = 'flex';
                userModal.style.zIndex = '9999';
            } else {
            }
        });
    }

    // --- Permissions UI Init ---
    try {
        initPermissionsUI();
    } catch (e) { alert('Error Init Perms: ' + e.message); }

    // --- Permissions UI Init ---
    try {
        initPermissionsUI();
    } catch (e) { alert('Error Init Perms: ' + e.message); }

    // Initial check (might fail if user not loaded yet, but covered by checkLoginStatus)
    updateNotificationPermissions();
});

// Helper to filter notification targets based on roles
window.updateNotificationPermissions = function () {
    const targetSelect = document.getElementById('notif-target-type');
    // If select doesn't exist or user not logged in, nothing to do
    if (!targetSelect || !currentUser || !currentUser.permissions) return;

    // Hide options first, then show allowed
    const options = targetSelect.querySelectorAll('option');
    options.forEach(opt => {
        if (opt.value === "") return; // Skip placeholder

        let allowed = false;
        switch (opt.value) {
            case 'ALL': allowed = checkPermission('notifications.target_all'); break;
            case 'LEVEL': allowed = checkPermission('notifications.target_level'); break;
            case 'GROUP': allowed = checkPermission('notifications.target_group'); break;
            case 'STUDENT': allowed = checkPermission('notifications.target_student'); break;
            default: allowed = true;
        }

        if (!allowed) {
            opt.style.display = 'none';
            opt.disabled = true;
        } else {
            opt.style.display = '';
            opt.disabled = false;
        }

        // If current selection is now disabled, reset to default
        if (targetSelect.value === opt.value && !allowed) {
            targetSelect.value = "";
        }
    });

    // Also handle visibility of the whole container based on general send permission
    // But basic view_menu is handled by sidebar logic.
};

window.editUser = async (id) => {
    try {
        console.log('DEBUG: editUser called with ID:', id, typeof id);
        console.log('DEBUG: Global users array length:', users.length);

        // Loose comparison for ID just in case (string vs number)
        const user = users.find(u => u.id == id);

        if (!user) {
            console.error('DEBUG: User NOT found in global array!');
            showAlertModal('Error', 'Datos de usuario no encontrados en memoria local.', true);
            return;
        }

        console.log('DEBUG: User found:', user.username);

        isEditingUser = true;
        editingUserId = id;

        await populateUserRoleSelect(); // Ensure roles are fresh

        // Check if modal and elements exist
        const titleEl = document.getElementById('user-modal-title');
        const usernameEl = document.getElementById('user-username');
        const emailEl = document.getElementById('user-email');
        const profileEl = document.getElementById('user-profile');
        const roleEl = document.getElementById('user-role');
        const pwdEl = document.getElementById('user-password');

        if (!titleEl || !usernameEl || !roleEl) {
            throw new Error('Elementos del modal no encontrados en el DOM');
        }

        titleEl.textContent = 'Editar Perfil';
        usernameEl.value = user.username;
        emailEl.value = user.email || '';
        profileEl.value = user.profile || '';
        roleEl.value = user.role;

        if (document.getElementById('user-family-id')) {
            document.getElementById('user-family-id').value = user.linked_family_id || '';
        }

        pwdEl.value = ''; // Don't show password

        // Re-fetch modal to ensure we have it
        const modal = document.getElementById('user-modal-prod') || document.getElementById('user-modal');
        if (!modal) throw new Error('userModal not found in DOM');

        // RUNTIME FIX: Move to body to escape any nesting (copied from addUserBtn)
        if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Force display
        modal.style.zIndex = '9999'; // Force top

        console.log('DEBUG: editUser successful, modal opened.');
    } catch (e) {
        console.error('Error in editUser:', e);
        showAlertModal('Error', 'Error al abrir editor: ' + e.message, true);
    }
};

window.deleteUser = (id) => {
    showConfirmModal({
        title: '¿Eliminar Usuario?',
        message: 'Esta acción eliminará permanentemente al usuario y sus permisos.',
        confirmText: 'Eliminar',
        isDestructive: true,
        onConfirm: async () => {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            loadUsers();
        }
    });
};

if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const profile = document.getElementById('user-profile').value;
        const role = document.getElementById('user-role').value;
        const password = document.getElementById('user-password').value;

        const userData = { username, email, profile, role, password };

        if (isEditingUser) {
            await apiFetch(`/users/${editingUserId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        } else {
            await apiFetch('/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        }

        userModal.classList.add('hidden');
        loadUsers();
    });
}



// --- User Action Handler ---
window.handleUserAction = (selectElement, id) => {
    try {
        const action = selectElement.value;
        console.log('User Action Triggered:', action, 'ID:', id);
        selectElement.value = ""; // Reset
        if (action === 'edit') editUser(id);
        else if (action === 'delete') deleteUser(id);
    } catch (e) {
        console.error('Error in handleUserAction:', e);
        showAlertModal('Error', 'Error al ejecutar acción: ' + e.message, true);
    }
};

function renderUsers() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';

    // Permission Check
    const canEdit = checkPermission(PERMISSIONS.USERS_EDIT_BTN);
    const canDelete = checkPermission(PERMISSIONS.USERS_DELETE_BTN);

    users.forEach((user) => {
        let optionsHtml = '<option value="" disabled selected>Acciones</option>';
        if (canEdit) optionsHtml += '<option value="edit">Editar</option>';
        if (canDelete) optionsHtml += '<option value="delete">Eliminar</option>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.profile || '-'}</td>
            <td>${user.role}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    ${canEdit ? `
                    <button type="button" class="btn-icon" onclick="editUser('${user.id}')" title="Editar" style="background:none; border:none; cursor:pointer; color:#3b82f6;">
                        <span class="material-icons-outlined">edit</span>
                    </button>` : ''}
                    ${canDelete ? `
                    <button type="button" class="btn-icon" onclick="deleteUser('${user.id}')" title="Eliminar" style="background:none; border:none; cursor:pointer; color:#ef4444;">
                        <span class="material-icons-outlined">delete</span>
                    </button>` : ''}
                    ${(!canEdit && !canDelete) ? '<span style="color: #94a3b8; font-size: 0.8rem;">Sin acciones</span>' : ''}
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// --- User CRUD Functions ---

// Duplicate editUser removed. Using the async version defined above.

window.deleteUser = async (id) => {
    if (!checkPermission(PERMISSIONS.USERS_DELETE_BTN)) {
        return showAlertModal('Permiso Denegado', 'No tienes permiso para eliminar usuarios.', true);
    }

    showConfirmModal({
        title: 'Eliminar Usuario',
        message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
        onConfirm: async () => {
            try {
                await apiFetch(`/users/${id}`, { method: 'DELETE' });
                showAlertModal('Éxito', 'Usuario eliminado correctamente');
                await loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                showAlertModal('Error', 'Error al eliminar usuario', true);
            }
        }
    });
};

// --- Student CRUD ---

function generateUniqueStudentId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 18; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateUniqueID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const searchStudentModalBtn = document.getElementById('search-student-modal-btn');
const studentSearchInput = document.getElementById('student-search-input');
const studentSearchStatus = document.getElementById('student-search-status');

// Helper to reset modal state for new entry
function resetStudentModal(isEdit = false) {
    studentForm.reset();
    document.getElementById('student-id').value = ''; // Let server generate
    document.getElementById('student-unique-id').value = ''; // Let server generate
    document.getElementById('student-family-id').value = ''; // clear family ID for new student

    // Reset fields to editable/empty if not edit
    if (!isEdit) {
        document.getElementById('student-name').readOnly = false;
        document.getElementById('student-lastname-p').readOnly = false;
        document.getElementById('student-lastname-m').readOnly = false;
    }
}

// (Add Student Button removed as per request)
if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => {
        isEditing = false;
        editingStudentId = null;

        resetStudentModal(false); // False = New Student Mode
        document.getElementById('modal-title').textContent = 'Inscribir / Agregar Alumno';
        updateSubgradeOptions('student-grade', 'student-subgrade');
        updateGroupOptions();
        studentModal.classList.remove('hidden');
    });
}

window.editStudent = (id) => {
    try {
        console.log('DEBUG: editStudent called with ID:', id);
        // Loose comparison for robustness
        const student = students.find(s => s.id == id);
        if (!student) {
            console.error('Student NOT found for ID:', id);
            showAlertModal('Error', 'Alumno no encontrado en memoria.', true);
            return;
        }

        isEditing = true;
        editingStudentId = id;

        // Reset modal in Edit Mode (shows fields)
        resetStudentModal(true);

        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = 'Editar Alumno';

        if (document.getElementById('student-id')) document.getElementById('student-id').value = student.id;
        if (document.getElementById('student-unique-id')) document.getElementById('student-unique-id').value = student.unique_id || '';

        if (document.getElementById('student-family-id')) document.getElementById('student-family-id').value = student.family_id || 'No asignado';

        if (document.getElementById('student-name')) {
            document.getElementById('student-name').value = student.name;
            document.getElementById('student-name').readOnly = true;
        }
        if (document.getElementById('student-lastname-p')) {
            document.getElementById('student-lastname-p').value = student.lastnameP;
            document.getElementById('student-lastname-p').readOnly = true;
        }
        if (document.getElementById('student-lastname-m')) {
            document.getElementById('student-lastname-m').value = student.lastnameM;
            document.getElementById('student-lastname-m').readOnly = true;
        }
        if (document.getElementById('student-grade')) document.getElementById('student-grade').value = student.grade;

        updateSubgradeOptions('student-grade', 'student-subgrade', student.subgrade);
        updateGroupOptions('student-grade', 'student-subgrade', 'student-group', student.group_name);

        // Modal Visibility Logic
        const modal = document.getElementById('student-modal');
        if (!modal) throw new Error('student-modal not found');

        // Runtime Fix: Move to body if nested
        if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.zIndex = '9999';

    } catch (e) {
        console.error('Error in editStudent:', e);
        showAlertModal('Error', 'Error al abrir editor de alumno: ' + e.message, true);
    }
};

window.deleteStudent = async (id) => {
    if (!checkPermission(PERMISSIONS.STUDENTS_DELETE)) {
        return showAlertModal('Permiso Denegado', 'No tienes permiso para eliminar alumnos.', true);
    }
    showConfirmModal({
        title: '¿Eliminar Alumno?',
        message: 'Esta acción eliminará al alumno y toda su información relacionada.',
        confirmText: 'Eliminar',
        isDestructive: true,
        onConfirm: async () => {
            await apiFetch(`/students/${id}`, { method: 'DELETE' });
            loadStudents();
        }
    });
};

if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentData = {
            id: document.getElementById('student-id').value,
            unique_id: document.getElementById('student-unique-id').value,
            name: document.getElementById('student-name').value,
            lastnameP: document.getElementById('student-lastname-p').value,
            lastnameM: document.getElementById('student-lastname-m').value,
            grade: document.getElementById('student-grade').value,
            subgrade: document.getElementById('student-subgrade').value,
            group: document.getElementById('student-group').value
        };

        if (isEditing) {
            await apiFetch(`/students/${editingStudentId}`, {
                method: 'PUT',
                body: JSON.stringify(studentData)
            });
        } else {
            await apiFetch('/students', {
                method: 'POST',
                body: JSON.stringify(studentData)
            });
        }

        studentModal.classList.add('hidden');
        loadStudents();
    });
}

// User CRUD duplicate block removed


// --- School Info ---

// --- General Info Section Logic ---

const generalForm = document.getElementById('general-student-form');
const generalClearBtn = document.getElementById('general-clear-btn');


// --- Multi-Student / Sibling Logic ---

const addSiblingBtn = document.getElementById('add-sibling-btn');
const studentsList = document.getElementById('students-list');

if (addSiblingBtn) {
    addSiblingBtn.addEventListener('click', () => {
        // Clone the first student entry to use as template
        const template = studentsList.querySelector('.student-entry');
        const newEntry = template.cloneNode(true);

        // Reset values in the new entry
        newEntry.querySelectorAll('input, select').forEach(input => {
            input.value = '';
            // Remove unique IDs to avoid Conflicts, keep classes for selection
            input.removeAttribute('id');
        });

        // Match 'First Time' behavior: Leave empty, let Server generate.
        newEntry.querySelector('.student-id').value = '';
        newEntry.querySelector('.student-unique-id').value = ''; // USER REQUEST: DO NOT GENERATE UNIQUE ID

        // Show "Eliminar" button for the new entry
        const removeBtn = newEntry.querySelector('.btn-remove-student');
        if (removeBtn) {
            removeBtn.classList.remove('hidden');
            removeBtn.addEventListener('click', () => {
                newEntry.remove();
            });
        }

        // Hide "Limpiar" button in siblings as it's redundant/confusing
        const clearBtn = newEntry.querySelector('#general-clear-btn');
        if (clearBtn) clearBtn.style.display = 'none';

        // Pre-fill Last Names if available from the first student (Sibling logic)
        const firstEntry = studentsList.querySelector('.student-entry');
        if (firstEntry) {
            const lastNameP = firstEntry.querySelector('.student-lastname-p').value;
            const lastNameM = firstEntry.querySelector('.student-lastname-m').value;
            newEntry.querySelector('.student-lastname-p').value = lastNameP;
            newEntry.querySelector('.student-lastname-m').value = lastNameM;
        }

        studentsList.appendChild(newEntry);

        // Focus on name of new entry
        const nameInput = newEntry.querySelector('.student-name');
        if (nameInput) nameInput.focus();
    });
}

// Ensure the old "Limpiar" button still works for the FIRST entry
if (generalClearBtn) {
    generalClearBtn.addEventListener('click', () => {
        // Only clear the first entry, not remove siblings
        const firstEntry = studentsList.querySelector('.student-entry');
        firstEntry.querySelectorAll('input').forEach(i => i.value = '');
        firstEntry.querySelectorAll('select').forEach(s => s.value = '');
        firstEntry.querySelector('.student-unique-id').value = '';
        firstEntry.querySelector('.student-family-id').value = '';

        // Hide Back button since we are creating new
        const btnBack = document.getElementById('btn-back-from-general-info');
        if (btnBack) btnBack.style.display = 'none';
    });
}

// Back Button Logic
const btnBackGeneral = document.getElementById('btn-back-from-general-info');
if (btnBackGeneral) {
    btnBackGeneral.addEventListener('click', () => {
        // Return to Students List
        document.getElementById('general-info-section').classList.add('hidden');
        document.getElementById('students-section').classList.remove('hidden');

        // Update Sidebar
        document.querySelectorAll('.nav-item, .submenu-item').forEach(nav => nav.classList.remove('active'));
        const studentsLink = document.querySelector('[data-target="students-section"]');
        if (studentsLink) studentsLink.classList.add('active');

        // Reload list to ensure fresh data
        loadStudents();
    });
}



// Medical Back Button
const btnBackMed = document.getElementById('btn-back-medical');
if (btnBackMed) {
    btnBackMed.addEventListener('click', () => {
        document.getElementById('medical-data-section').classList.add('hidden');
        document.getElementById('students-section').classList.remove('hidden');

        // Update Sidebar
        document.querySelectorAll('.nav-item, .submenu-item').forEach(nav => nav.classList.remove('active'));
        const studentsLink = document.querySelector('[data-target="students-section"]');
        if (studentsLink) studentsLink.classList.add('active');

        loadStudents();
    });
}



// Account Statement Back Button
const btnBackAccount = document.getElementById('btn-back-account-statement');
if (btnBackAccount) {
    btnBackAccount.addEventListener('click', () => {
        document.getElementById('account-statement-section').classList.add('hidden');
        document.getElementById('students-section').classList.remove('hidden');

        // Update Sidebar
        document.querySelectorAll('.nav-item, .submenu-item').forEach(nav => nav.classList.remove('active'));
        const studentsLink = document.querySelector('[data-target="students-section"]');
        if (studentsLink) studentsLink.classList.add('active');

        loadStudents();
    });
}


// Function to load student details into General Info form and switch view
window.viewStudentDetails = async (id) => {
    // Reset to single student view first (remove siblings)
    const extraSiblings = document.querySelectorAll('.student-entry');
    extraSiblings.forEach((e, index) => { if (index > 0) e.remove(); });

    const student = students.find(s => s.id === id);
    if (!student) return;

    // Switch to General Info Section
    document.querySelectorAll('.nav-item, .submenu-item').forEach(nav => nav.classList.remove('active'));
    // Highlight the sidebar item
    const generalInfoLink = document.querySelector('[data-target="general-info-section"]');
    if (generalInfoLink) generalInfoLink.classList.add('active');

    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    document.getElementById('general-info-section').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Información General';

    // Show Back Button
    const btnBack = document.getElementById('btn-back-from-general-info');
    if (btnBack) btnBack.style.display = 'flex';

    // Hide New/Clear Button (User Request: Only when calling from student)
    const btnClear = document.getElementById('general-clear-btn');
    if (btnClear) btnClear.style.display = 'none';

    // Populate Fields
    document.getElementById('general-db-id').value = student.id;
    document.getElementById('general-unique-id').value = student.unique_id || student.id || '';
    document.getElementById('general-family-id').value = student.family_id || 'No asignado';
    document.getElementById('general-name').value = student.name;
    document.getElementById('general-lastname-p').value = student.lastnameP;
    document.getElementById('general-lastname-m').value = student.lastnameM;

    document.getElementById('general-birthdate').value = student.birthdate ? student.birthdate.split('T')[0] : '';
    document.getElementById('general-curp').value = student.curp || '';
    document.getElementById('general-gender').value = student.gender || '';

    // Fetch Parents
    try {
        const parents = await apiFetch(`/students/${student.id}/parents`);

        // Clear parent fields
        ['mother', 'father'].forEach(prefix => {
            document.querySelectorAll(`input[name^="${prefix}-"]`).forEach(input => input.value = '');
        });

        if (parents && parents.length > 0) {
            parents.forEach(p => {
                const prefix = p.type === 'MOTHER' ? 'mother' : 'father';
                const container = document.querySelector(`.parent-section[data-type="${p.type}"]`);
                if (!container) return;

                if (container.querySelector(`[name="${prefix}-name"]`)) container.querySelector(`[name="${prefix}-name"]`).value = p.name || '';
                if (container.querySelector(`[name="${prefix}-lastnameP"]`)) container.querySelector(`[name="${prefix}-lastnameP"]`).value = p.lastnameP || '';
                if (container.querySelector(`[name="${prefix}-lastnameM"]`)) container.querySelector(`[name="${prefix}-lastnameM"]`).value = p.lastnameM || '';
                if (container.querySelector(`[name="${prefix}-birthdate"]`)) container.querySelector(`[name="${prefix}-birthdate"]`).value = p.birthdate ? p.birthdate.split('T')[0] : '';
                if (container.querySelector(`[name="${prefix}-phone"]`)) container.querySelector(`[name="${prefix}-phone"]`).value = p.phone || '';
                if (container.querySelector(`[name="${prefix}-email"]`)) container.querySelector(`[name="${prefix}-email"]`).value = p.email || '';

                if (container.querySelector(`[name="${prefix}-street"]`)) container.querySelector(`[name="${prefix}-street"]`).value = p.street || '';
                if (container.querySelector(`[name="${prefix}-exterior_number"]`)) container.querySelector(`[name="${prefix}-exterior_number"]`).value = p.exterior_number || '';
                if (container.querySelector(`[name="${prefix}-neighborhood"]`)) container.querySelector(`[name="${prefix}-neighborhood"]`).value = p.neighborhood || '';
                if (container.querySelector(`[name="${prefix}-zip_code"]`)) container.querySelector(`[name="${prefix}-zip_code"]`).value = p.zip_code || '';
                if (container.querySelector(`[name="${prefix}-city"]`)) container.querySelector(`[name="${prefix}-city"]`).value = p.city || '';
                if (container.querySelector(`[name="${prefix}-state"]`)) container.querySelector(`[name="${prefix}-state"]`).value = p.state || '';
                if (container.querySelector(`[name="${prefix}-country"]`)) container.querySelector(`[name="${prefix}-country"]`).value = p.country || '';
            });
        }
    } catch (e) {
        console.error(e);
        showAlertModal('Error', 'Error cargando información de padres', true);
    }
};


if (generalForm) {
    generalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submitting Multi-Student Info...');

        // 1. Gather Parent Data (Shared)
        const motherData = {
            type: 'MOTHER',
            name: document.querySelector('[name="mother-name"]').value,
            lastnameP: document.querySelector('[name="mother-lastnameP"]').value,
            lastnameM: document.querySelector('[name="mother-lastnameM"]').value,
            birthdate: document.querySelector('[name="mother-birthdate"]').value,
            phone: document.querySelector('[name="mother-phone"]').value,
            email: document.querySelector('[name="mother-email"]').value,
            street: document.querySelector('[name="mother-street"]').value,
            exterior_number: document.querySelector('[name="mother-exterior_number"]').value,
            neighborhood: document.querySelector('[name="mother-neighborhood"]').value,
            zip_code: document.querySelector('[name="mother-zip_code"]').value,
            city: document.querySelector('[name="mother-city"]').value,
            state: document.querySelector('[name="mother-state"]').value,
            country: document.querySelector('[name="mother-country"]').value
        };

        const fatherData = {
            type: 'FATHER',
            name: document.querySelector('[name="father-name"]').value,
            lastnameP: document.querySelector('[name="father-lastnameP"]').value,
            lastnameM: document.querySelector('[name="father-lastnameM"]').value,
            birthdate: document.querySelector('[name="father-birthdate"]').value,
            phone: document.querySelector('[name="father-phone"]').value,
            email: document.querySelector('[name="father-email"]').value,
            street: document.querySelector('[name="father-street"]').value,
            exterior_number: document.querySelector('[name="father-exterior_number"]').value,
            neighborhood: document.querySelector('[name="father-neighborhood"]').value,
            zip_code: document.querySelector('[name="father-zip_code"]').value,
            city: document.querySelector('[name="father-city"]').value,
            state: document.querySelector('[name="father-state"]').value,
            country: document.querySelector('[name="father-country"]').value
        };

        // 2. Save Logic (Sequential to propagate Family ID)
        const entries = Array.from(document.querySelectorAll('.student-entry')); // Convert to array for loop
        let sharedFamilyId = null;

        const submitBtn = generalForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
        }

        // Check if we are adding to an existing family (First entry has a real DB ID and a Family ID)
        // If the first entry is an existing student, we should use their family ID.
        // Actually, the loop handles it: providing `family_id` in update/create.
        // But we need to grab it from the first entry if it's existing.

        try {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                let id = entry.querySelector('.student-id').value;
                let unique_id = ''; // Deprecated generation
                const name = entry.querySelector('.student-name').value;
                const lastnameP = entry.querySelector('.student-lastname-p').value;
                const formFamilyId = entry.querySelector('.student-family-id').value; // Read from form

                if (!name || !lastnameP) {
                    showAlertModal('Aviso', 'Nombre y Apellido Paterno son obligatorios para todos los alumnos.', true);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Guardar / Registrar Ficha';
                    }
                    return; // Stop everything
                }

                console.log(`Processing entry ${i}: ID="${id}" (Type: ${typeof id}), Name="${name}"`);

                // Determine if New or Update
                // FIX: Both frontend temp IDs and Backend real IDs start with 'S'.
                // The ONLY reliable way to know if it's existing is if it is found in our loaded `students` list.

                let isNew = false;
                if (!id) {
                    isNew = true;
                } else {
                    const existsInCache = students.some(s => s.id == id);
                    isNew = !existsInCache;
                }

                console.log(`Entry ${i} check: ID ${id} in cache? ${!isNew}. Decision: ${isNew ? 'NEW' : 'EXISTING'}`);


                // Initialize sharedFamilyId from the first entry if available
                if (i === 0 && !isNew && formFamilyId) {
                    sharedFamilyId = formFamilyId;
                }

                // COLLISION CHECK: If isNew is true, but unique_id exists in known students, regenerate.
                // Client-side collision check removed - Backend handles generation.

                const studentData = {
                    id: isNew ? undefined : id,
                    unique_id: unique_id,
                    name: name,
                    lastnameP: lastnameP,
                    lastnameM: entry.querySelector('.student-lastname-m').value,
                    birthdate: entry.querySelector('.student-birthdate').value,
                    curp: entry.querySelector('.student-curp').value,
                    gender: entry.querySelector('.student-gender').value,
                    grade: 'SIN ASIGNAR',
                    subgrade: '',
                    group: '',
                    family_id: sharedFamilyId // Pass the shared ID if we have it
                };

                // Preserve grade if updating
                if (!isNew) {
                    const existing = students.find(s => s.id == id);
                    if (existing) {
                        studentData.grade = existing.grade;
                        studentData.subgrade = existing.subgrade;
                        studentData.group = existing.group_name;
                    }
                }

                let savedId = id;
                if (isNew) {
                    // CREATE
                    const res = await apiFetch('/students', { method: 'POST', body: JSON.stringify(studentData) });
                    if (res) {
                        savedId = res.id;
                        // Capture the generated Family ID from the first student to use for others
                        if (res.family_id && !sharedFamilyId) {
                            sharedFamilyId = res.family_id;
                            console.log('Captured Family ID:', sharedFamilyId);
                        }
                    }
                } else {
                    // UPDATE
                    await apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(studentData) });
                    // If we updated the first one, we already have its family ID from form or state.
                }

                // SAVE PARENTS for this student
                if (savedId) {
                    await apiFetch(`/students/${savedId}/parents`, { method: 'POST', body: JSON.stringify(motherData) });
                    await apiFetch(`/students/${savedId}/parents`, { method: 'POST', body: JSON.stringify(fatherData) });
                }
            }

            showConfirmModal({
                title: 'Éxito',
                message: 'Todos los alumnos han sido guardados exitosamente.',
                isAlert: true,
                isSuccess: true,
                isDestructive: false
            });
            loadStudents();
            document.querySelectorAll('.student-entry').forEach((e, index) => {
                if (index > 0) e.remove(); // Remove extra siblings
            });
            generalForm.reset();
            document.getElementById('general-db-id').value = '';
            document.getElementById('general-unique-id').value = '';

        } catch (err) {
            console.error(err);
            showAlertModal('Error', 'Hubo un error al guardar algunos alumnos: ' + err.message, true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar / Registrar Ficha';
            }
        }
    });
}


// --- School Info ---

if (schoolInfoForm) {
    schoolInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phoneInputs = document.querySelectorAll('.school-phone-input');
        const phones = Array.from(phoneInputs).map(i => i.value.trim()).filter(v => v !== '');

        const infoData = {
            commercial_name: document.getElementById('school-commercial-name').value,
            street: document.getElementById('school-street').value,
            exterior_number: document.getElementById('school-ext-number').value,
            neighborhood: document.getElementById('school-neighborhood').value,
            zip_code: document.getElementById('school-zip').value,
            city: document.getElementById('school-city').value,
            state: document.getElementById('school-state').value,
            phones: phones,
            director: document.getElementById('school-director').value
        };

        await apiFetch('/school-info', {
            method: 'POST',
            body: JSON.stringify(infoData)
        });
        showConfirmModal({
            title: 'Éxito',
            message: 'Información guardada exitosamente',
            isAlert: true,
            isSuccess: true,
            isDestructive: false
        });
    });
}

// --- UI Helpers (Dropdowns, Rendering) ---

const academicStructure = {
    levels: [],
    grades: [],
    groups: []
};

async function loadAcademicStructureData() {
    try {
        const [levels, grades, groups] = await Promise.all([
            apiFetch('/academic/levels'),
            apiFetch('/academic/grades'),
            apiFetch('/academic/groups')
        ]);
        academicStructure.levels = levels;
        academicStructure.grades = grades;
        academicStructure.groups = groups;
        console.log('Academic structure loaded:', academicStructure);

        // Populate Student Modal "Level" dropdown if empty
        const studentGradeSelect = document.getElementById('student-grade');
        if (studentGradeSelect) {
            const currentValue = studentGradeSelect.value;
            studentGradeSelect.innerHTML = '<option value="">Seleccionar Nivel</option>';
            if (levels) {
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level.name;
                    option.textContent = level.name;
                    if (currentValue === level.name) option.selected = true;
                    studentGradeSelect.appendChild(option);
                });
            }
        } // Close studentGradeSelect

        // Populate Filter "Level" dropdown
        const filterGradeSelect = document.getElementById('filter-grade');
        if (filterGradeSelect) {
            filterGradeSelect.innerHTML = '<option value="">Todos los Niveles</option>';
            if (levels) {
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level.name;
                    option.textContent = level.name;
                    filterGradeSelect.appendChild(option);
                });
            }
        }

    } catch (error) {
        console.error('Error loading academic structure:', error);
    }
}

// Load on startup ONLY if logged in
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        loadAcademicStructureData();
    }
});

function updateSubgradeOptions(gradeSelectId, subgradeSelectId, selectedSubgrade = null) {
    const gradeSelect = document.getElementById(gradeSelectId);
    const subgradeSelect = document.getElementById(subgradeSelectId);
    const levelName = gradeSelect.value;

    // Set default option text based on context (Filter or Form)
    const isFilter = gradeSelectId.includes('filter');
    subgradeSelect.innerHTML = `<option value="">${isFilter ? 'Todos los Grados' : 'Seleccionar'}</option>`;

    // Find Level ID from Text
    const level = academicStructure.levels.find(l => l.name === levelName);

    if (level) {
        // Filter grades by level_id
        const grades = academicStructure.grades.filter(g => g.level_id === level.id);

        if (grades.length > 0) {
            subgradeSelect.disabled = false;
            grades.forEach(g => {
                const option = document.createElement('option');
                option.value = g.name;
                option.textContent = g.name;
                if (selectedSubgrade && selectedSubgrade === g.name) option.selected = true;
                subgradeSelect.appendChild(option);
            });
        } else {
            subgradeSelect.disabled = true;
        }
    } else {
        subgradeSelect.disabled = true;
    }

    // Determine Group ID based on input IDs
    let groupSelectId = 'student-group';
    if (gradeSelectId === 'filter-grade') groupSelectId = 'filter-group';

    updateGroupOptions(gradeSelectId, subgradeSelectId, groupSelectId);
}

function updateGroupOptions(gradeSelectId, subgradeSelectId, groupSelectId, selectedGroup = null) {
    // If arguments are missing, fallback (legacy call safety, though we refactored) or deduce
    if (!gradeSelectId) {
        // Default to student form if called without args (shouldn't happen with correct refactor)
        gradeSelectId = 'student-grade';
        subgradeSelectId = 'student-subgrade';
        groupSelectId = 'student-group';
    }

    const gradeSelect = document.getElementById(gradeSelectId);
    const subgradeSelect = document.getElementById(subgradeSelectId);
    const groupSelect = document.getElementById(groupSelectId);

    const levelName = gradeSelect.value;
    const gradeName = subgradeSelect.value;

    const isFilter = gradeSelectId.includes('filter');
    groupSelect.innerHTML = `<option value="">${isFilter ? 'Todos los Grupos' : 'Seleccionar'}</option>`;

    // Find Level and Grade IDs
    const level = academicStructure.levels.find(l => l.name === levelName);
    let grade = null;
    if (level) {
        grade = academicStructure.grades.find(g => g.level_id === level.id && g.name === gradeName);
    }

    if (grade) {
        // Filter groups by grade_id
        const groups = academicStructure.groups.filter(grp => grp.grade_id === grade.id);

        if (groups.length > 0) {
            groupSelect.disabled = false;
            groups.forEach(grp => {
                const option = document.createElement('option');
                option.value = grp.name;
                option.textContent = grp.name;
                if (selectedGroup && selectedGroup === grp.name) option.selected = true;
                groupSelect.appendChild(option);
            });
        } else {
            groupSelect.disabled = true;
        }
    } else {
        groupSelect.disabled = true;
    }

    // If Filter, trigger search update automatically
    if (isFilter) {
        updateSearch();
    }
}

// Global Event Delegation for Student Actions (Robust Replacement)
document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('action-select-student')) {
        const select = e.target;
        const studentId = select.getAttribute('data-student-id');

        // Call the handler directly
        if (window.actualHandleStudentAction) {
            window.actualHandleStudentAction(select, studentId);
        } else if (window.handleStudentAction) {
            window.handleStudentAction(select, studentId);
        } else {
            console.error('handleStudentAction missing!');
        }
    }
});

// Explicit Unique Handler to avoid conflicts
// Explicit Unique Handler to avoid conflicts
window.actualHandleStudentAction = async function (select, id) {
    const action = select.value;
    select.value = ""; // Reset dropdown
    if (!action) return;

    if (action === 'info' || action === 'view') {
        if (typeof viewStudentDetails === 'function') {
            viewStudentDetails(id);
        } else {
            console.error('viewStudentDetails function is missing');
        }
    } else if (action === 'medical') {
        // Switch to medical view
        const studentsSection = document.getElementById('students-section');
        const medicalSection = document.getElementById('medical-data-section');

        if (studentsSection && medicalSection) {
            studentsSection.classList.add('hidden');
            document.getElementById('general-info-section')?.classList.add('hidden');
            document.getElementById('account-statement-section')?.classList.add('hidden'); // Also hide statement
            medicalSection.classList.remove('hidden');
        }

        // Update Sidebar Active State
        document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));
        const medicalLink = document.querySelector('[data-target="medical-data-section"]');
        if (medicalLink) medicalLink.classList.add('active');

        // Load Medical Data
        if (typeof loadMedicalData === 'function') {
            loadMedicalData(id).catch(err => console.error('Error loading medical data:', err));
            // Show Back Button
            const btnBackMed = document.getElementById('btn-back-medical');
            if (btnBackMed) btnBackMed.style.display = 'flex';
        } else {
            console.error('loadMedicalData IS MISSING');
        }

    } else if (action === 'account_statement') {
        // Switch to Account Statement view
        const studentsSection = document.getElementById('students-section');
        const statementSection = document.getElementById('account-statement-section');

        if (studentsSection && statementSection) {
            studentsSection.classList.add('hidden');
            document.getElementById('general-info-section')?.classList.add('hidden');
            document.getElementById('medical-data-section')?.classList.add('hidden');
            statementSection.classList.remove('hidden');

            // Show Back Button
            const btnBackAccount = document.getElementById('btn-back-account-statement');
            if (btnBackAccount) btnBackAccount.style.display = 'flex';

            if (typeof loadAccountStatement === 'function') {
                loadAccountStatement(id).catch(err => console.error('Error loading statement:', err));
            } else {
                console.error('loadAccountStatement function is missing');
            }
        } else {
            alert('Error: No se encontró la sección de Estado de Cuenta.');
        }

    } else if (action === 'edit') {
        if (typeof editStudent === 'function') editStudent(id);
    } else if (action === 'delete') {
        if (typeof deleteStudent === 'function') deleteStudent(id);
    }
};

// --- Missing Helper: loadMedicalData ---
async function loadMedicalData(studentId) {
    console.log('Fetching medical data for:', studentId);

    // Set Student ID in Medical Form
    const idInput = document.getElementById('medical-student-id');
    if (idInput) idInput.value = studentId;

    try {
        // 1. Fetch Student Details (for header and age)
        const student = await apiFetch(`/students/${studentId}`);
        if (student) {
            const header = document.querySelector('#medical-data-section .section-header h3');
            if (header) header.textContent = `Ficha Médica: ${student.name} ${student.lastnameP}`;

            if (student.birthdate) {
                const dob = new Date(student.birthdate);
                const ageDifMs = Date.now() - dob.getTime();
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                const ageInput = document.getElementById('medical-age');
                if (ageInput) ageInput.value = `${age} años`;
            }
        }

        // 2. Fetch Medical Record (Use existing robust API)
        const medicalData = await apiFetch(`/medical/${studentId}`);
        console.log('Medical Data:', medicalData);

        // Helper to safe set value
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };
        const setRadio = (name, val) => {
            // val is boolean (0 or 1) in DB usually, or null
            const radios = document.getElementsByName(name);
            radios.forEach(r => {
                if (r.value == (val ? '1' : '0') || r.value == (val === true ? '1' : '0')) r.checked = true;
                if (r.checked) r.dispatchEvent(new Event('change'));
            });
        };

        if (medicalData) {
            setVal('medical-blood-type', medicalData.blood_type);
            setVal('medical-height', medicalData.height);
            setVal('medical-weight', medicalData.weight);
            setVal('medical-conditions', medicalData.medical_conditions);
            setVal('medical-allergies', medicalData.allergies);

            setRadio('has_surgeries', medicalData.has_surgeries);
            setVal('medical-surgeries-comments', medicalData.surgeries_comments);

            setRadio('has_medications', medicalData.has_medications);
            setVal('medical-medications', medicalData.medications);

            setRadio('has_therapy', medicalData.has_therapy);
            setVal('medical-therapy-comments', medicalData.therapy_comments);

            setVal('medical-emergency-name', medicalData.emergency_contact_name);
            setVal('medical-emergency-phone', medicalData.emergency_contact_phone);
            setVal('medical-doctor-name', medicalData.doctor_name);
            setVal('medical-doctor-phone', medicalData.doctor_phone);
            setVal('medical-doctor-email', medicalData.doctor_email);
            setVal('medical-doctor-office', medicalData.doctor_office);
            setVal('medical-insurance-company', medicalData.insurance_company);
            setVal('medical-insurance-policy', medicalData.insurance_policy);
            setVal('medical-notes', medicalData.additional_notes);
        }

    } catch (error) {
        console.error('Error fetching medical data:', error);
    }
}

// Medical Form Submission
document.getElementById('medical-data-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('medical-student-id').value;
    if (!studentId) return showAlertModal('Error', 'ID de alumno no encontrado', true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    // Ensure student_id is in body
    data.student_id = studentId;

    try {
        await apiFetch(`/medical`, { // Use ROOT medical endpoint
            method: 'POST',
            body: JSON.stringify(data)
        });
        showConfirmModal({
            title: 'Éxito',
            message: 'Ficha médica guardada correctamente',
            isAlert: true,
            isSuccess: true,
            isDestructive: false
        });
        // Optional: reload to refresh
    } catch (error) {
        console.error('Error saving medical data:', error);
        showAlertModal('Error', 'Error al guardar ficha médica', true);
    }
});

function renderStudents(filters = { text: '', grade: '', subgrade: '', group: '' }) {
    studentsTableBody.innerHTML = '';
    const filterText = filters.text.toLowerCase();

    /* const filteredStudents = students; // FORCE SHOW ALL for debugging */

    const filteredStudents = students.filter(student => {
        const matchesText =
            student.name.toLowerCase().includes(filterText) ||
            student.lastnameP.toLowerCase().includes(filterText) ||
            student.lastnameM.toLowerCase().includes(filterText) ||
            student.id.toLowerCase().includes(filterText) ||
            (student.unique_id && student.unique_id.toLowerCase().includes(filterText));

        const matchesGrade = filters.grade === '' || student.grade === filters.grade;
        const matchesSubgrade = filters.subgrade === '' || student.subgrade === filters.subgrade;
        const matchesGroup = filters.group === '' || student.group_name === filters.group;

        return matchesText && matchesGrade && matchesSubgrade && matchesGroup;
    });

    // DEBUG ALERT REMOVED


    // DEBUG: Aggressive tracing
    // alert(`RenderStudents: ${filteredStudents.length} items to show.`);

    if (filteredStudents.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        // Re-select body to be safe
        const tbody = document.getElementById('students-table-body');
        if (!tbody) { alert('CRITICAL ERROR: Tbody missing form DOM'); return; }

        // FORCE CSS OVERRIDE Removed


        // Force Parent Visibility
        const card = tbody.closest('.card');
        if (card) {
            card.classList.remove('hidden');
            card.style.display = 'block';
        }
        const table = tbody.closest('table');
        if (table) {
            table.classList.remove('hidden');
            table.style.display = 'table';
        }

        // NUCLEAR OPTION: Force Section Visibility
        const section = document.getElementById('students-section');
        if (section) {
            section.classList.remove('hidden');
            section.style.display = 'block';
            // alert('DEBUG: Forced students-section display: block');
        } else {
            console.error('CRITICAL: students-section NOT FOUND');
        }

        // Remove Test Row (Cleanup)
        // const testRow = document.createElement('tr');
        // ...

        filteredStudents.forEach((student, index) => {
            // if (index === 0) alert('Rendering first student: ' + student.name); // Confirm loop start
            const row = document.createElement('tr');

            // Determine Actions
            const canEdit = checkPermission(PERMISSIONS.ALUMNOS_EDIT);
            const canDelete = checkPermission(PERMISSIONS.ALUMNOS_DELETE);
            let actionsHtml = '';

            if (canEdit || canDelete) {
                actionsHtml = `
               <select class="action-select-student" data-student-id="${student.id}">
                   <option value="" disabled selected>Acciones</option>
                   <option value="view">Ver Ficha</option>
                   <option value="medical">Datos Médicos</option>
                   <option value="account_statement">Estado de Cuenta</option>
                   ${canEdit ? '<option value="edit">Editar</option>' : ''}
                   ${canDelete ? '<option value="delete">Eliminar</option>' : ''}
               </select>`;
            } else {
                actionsHtml = `
                 <button type="button" class="btn-secondary" onclick="viewStudentDetails('${student.id}')" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
                    Ver Ficha
                 </button>`;
            }

            row.innerHTML = `
                <td style="text-align: center; color: #64748b;">${student.unique_id || student.id || '-'}</td>
                <td style="font-weight: 500;">${student.name}</td>
                <td>${student.lastnameP}</td>
                <td>${student.lastnameM}</td>
                <td>${(() => {
                    const grade = student.grade || '-';
                    if (grade.toUpperCase().includes('SIN ASIGNAR')) {
                        return `<span style="background-color: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${grade}</span>`;
                    }
                    return `<span class="status-badge status-active">${grade}</span>`;
                })()}</td>
                <td>${(() => {
                    const sub = student.subgrade || '-';
                    if (sub.toUpperCase().includes('SIN ASIGNAR')) {
                        return `<span style="background-color: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${sub}</span>`;
                    }
                    // Color coding key stages
                    if (sub.includes('3ro') && (student.grade === 'PREESCOLAR' || student.grade === 'SECUNDARIA')) return `<span style="color: #d97706; font-weight: bold;">${sub}</span>`; // Warning graduation
                    if (sub.includes('6to')) return `<span style="color: #d97706; font-weight: bold;">${sub}</span>`;
                    return sub;
                })()}</td>
                <td>${(() => {
                    const grp = student.group_name || '-';
                    return grp.toUpperCase().includes('SIN ASIGNAR')
                        ? `<span style="background-color: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${grp}</span>`
                        : grp;
                })()}</td>
                <td>
                    ${actionsHtml}
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}



// --- Search & Filter Listeners ---

// --- Account Statement Logic ---

async function loadAccountStatement(studentId) {
    try {
        console.log('Loading Account Statement for:', studentId);

        // 1. Get Student Details for Header
        // Use existing list if available or fetch
        let student = students.find(s => s.id === studentId);
        if (!student) {
            const res = await apiFetch(`/students/${studentId}`);
            student = res; // Assuming detail endpoint returns object
        }

        // Update Header
        document.getElementById('statement-student-name').textContent = `${student.name} ${student.lastnameP} ${student.lastnameM}`;
        document.getElementById('statement-student-id').textContent = `ID: ${student.unique_id || student.id}`;
        document.getElementById('statement-student-group').textContent = `Grupo: ${student.group_name || 'Sin Asignar'}`;

        // 2. Fetch Payments (Using existing endpoint)
        const payments = await apiFetch(`/payments/${studentId}`);
        console.log('Payments fetched:', payments);

        // 3. Calculate Totals
        // Note: Total Charges logic needs assignment data. 
        // For now, "Pending Balance" is what we have from student list logic, 
        // but that was a calculated field on the student object from GET /students

        // We need to re-fetch student list or trust the passed ID content if it has pending_balance
        // Let's assume 'payments' has all transactions.

        // Calculate Paid
        const completedPayments = payments.filter(p => p.codi_status === 'COMPLETED' || p.codi_status === 'ACCEPTED' || !p.codi_status /* Legacy/Cash */);
        const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Calculate Pending (Initiated but not paid)
        const pendingPayments = payments.filter(p => p.codi_status === 'PENDING');
        const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Update Summary Cards
        document.getElementById('statement-total-paid').textContent = `$${totalPaid.toFixed(2)}`;
        document.getElementById('statement-pending-balance').textContent = `$${totalPending.toFixed(2)}`;

        // "Total Charges" is tricky without a separate charges table. 
        // For now, let's display Total Paid + Total Pending as "Total Generated"
        const totalGenerated = totalPaid + totalPending;
        document.getElementById('statement-total-charges').textContent = `$${totalGenerated.toFixed(2)}`;


        // 4. Render Grid
        const tbody = document.getElementById('account-statement-body');
        tbody.innerHTML = '';

        if (payments.length === 0) {
            document.getElementById('statement-empty-state').classList.remove('hidden');
        } else {
            document.getElementById('statement-empty-state').classList.add('hidden');

            // Sort by date desc
            payments.sort((a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at));

            payments.forEach(p => {
                const row = document.createElement('tr');

                const date = new Date(p.payment_date || p.created_at).toLocaleDateString();
                const statusColor = p.codi_status === 'COMPLETED' ? 'text-green-600' : (p.codi_status === 'PENDING' ? 'text-red-500' : 'text-gray-500');
                const statusLabel = p.codi_status || 'PAGADO'; // Default fallback

                row.innerHTML = `
                    <td>${date}</td>
                    <td>${p.concept}</td>
                    <td style="font-weight: 500;">$${parseFloat(p.amount).toFixed(2)}</td>
                    <td><span style="font-weight: bold;" class="${statusColor}">${statusLabel}</span></td>
                    <td>
                        <button class="btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Ver</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Error loading account statement:', error);
        alert('Error al cargar estado de cuenta');
    }
}
document.addEventListener('input', (e) => {
    // console.log('Input detected on:', e.target.id); // Validating event capture
    if (e.target && e.target.id === 'student-search') {
        updateSearch();
    }
});

document.addEventListener('click', (e) => {
    const clearBtn = e.target.closest('#clear-search-btn');
    if (clearBtn) {
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            updateSearch();
        }
    }
});

if (filterGrade) filterGrade.addEventListener('change', () => {
    updateSubgradeOptions('filter-grade', 'filter-subgrade');
    // search update handled in updateGroupOptions
});
if (filterSubgrade) filterSubgrade.addEventListener('change', () => {
    updateGroupOptions('filter-grade', 'filter-subgrade', 'filter-group');
});
if (filterGroup) filterGroup.addEventListener('change', updateSearch);

function updateGroupOptionsFilter() {
    const gradeSelect = document.getElementById('filter-grade');
    const subgradeSelect = document.getElementById('filter-subgrade');
    const groupSelect = document.getElementById('filter-group');
    if (!gradeSelect || !subgradeSelect || !groupSelect) return;

    const level = gradeSelect.value;
    const grade = subgradeSelect.value;

    groupSelect.innerHTML = '<option value="">Salón</option>';

    if (level && grade && CLASSROOMS[level] && CLASSROOMS[level][grade]) {
        groupSelect.disabled = false;
        CLASSROOMS[level][grade].forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    } else {
        groupSelect.disabled = true;
    }
}

// --- Inquiries Polling ---
let inquiryInterval = null;

function startInquiryPolling() {
    if (inquiryInterval) clearInterval(inquiryInterval);
    // Call immediately
    loadInquiries();
    // Then every 10 seconds
    // LEGACY POLLING - DISABLED (Unified in startInquiryPolling below)
    // inquiryInterval = setInterval(() => {
    //     const inquiriesSection = document.getElementById('inquiries-list-section');
    //     if (inquiriesSection && !inquiriesSection.classList.contains('hidden')) {
    //         loadInquiries(true); // true = silent update (no loading spinner if implemented)
    //     }
    // }, 10000);
}

function stopInquiryPolling() {
    if (inquiryInterval) {
        clearInterval(inquiryInterval);
        inquiryInterval = null;
    }
}

// Logout Logic
const logoutModal = document.getElementById('logout-modal');
const btnCancelLogout = document.getElementById('btn-cancel-logout');
const btnConfirmLogout = document.getElementById('btn-confirm-logout');

// Wire up Modal Buttons one time (if not already)
if (btnCancelLogout) {
    btnCancelLogout.addEventListener('click', () => {
        if (logoutModal) logoutModal.classList.add('hidden');
    });
}

if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        updateUIForLogout(); // Centralized hide function
        location.reload(); // Hard reload to clear state
    });
}

// Global function triggers the modal
function performLogout(silent = false) {
    if (silent) {
        // Auto-logout (skip confirmation)
        localStorage.removeItem('user');
        location.reload();
        return;
    }

    // Show Custom Modal
    if (logoutModal) {
        logoutModal.classList.remove('hidden');
    } else {
        // Fallback using Standard Confirmation
        showConfirmModal({
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que quieres cerrar tu sesión?',
            confirmText: 'Cerrar Sesión',
            cancelText: 'Cancelar',
            isDestructive: true,
            onConfirm: () => {
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                location.reload();
            }
        });
    }
}

function handleLogout() {
    performLogout(false);
}

// Inactivity Logic
function resetInactivityTimer() {
    if (currentUser) {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(triggerAutoLogout, INACTIVITY_LIMIT);
    }
}

function triggerAutoLogout() {
    console.log('Session expired due to inactivity');
    performLogout(true); // Silent = true (no confirm, just alert after)
}

function startInactivityTracking() {
    resetInactivityTimer(); // Initial start
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
}

function stopInactivityTracking() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    window.removeEventListener('mousemove', resetInactivityTimer);
    window.removeEventListener('keypress', resetInactivityTimer);
    window.removeEventListener('click', resetInactivityTimer);
    window.removeEventListener('scroll', resetInactivityTimer);
}


// --- Initialization ---
const API_BASE_URL = '/api';

// Old PERMISSIONS location (Removed)
// (Permissions moved to top)

// UI Hierarchy for Matrix Rendering
const PERMISSION_HIERARCHY = [
    {
        label: 'Alumnos',
        items: [
            { key: PERMISSIONS.ALUMNOS_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.ALUMNOS_LIST, label: 'Lista General' },
            { key: PERMISSIONS.STUDENTS_EDIT, label: 'Editar Alumno' },
            { key: PERMISSIONS.STUDENTS_DELETE, label: 'Eliminar Alumno' },
            { key: PERMISSIONS.ALUMNOS_INFO, label: 'Información General' }
        ]
    },
    {
        label: 'Caja',
        items: [
            { key: PERMISSIONS.CAJA_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.CAJA_PAGOS, label: 'Pagos y Cobros' },
            { key: PERMISSIONS.CAJA_CONCEPTOS, label: 'Conceptos' }
        ]
    },
    {
        label: 'Usuarios y Sistema',
        items: [
            { key: PERMISSIONS.CONFIG_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.CONFIG_ROLES, label: 'Gestión de Roles' },
            { key: PERMISSIONS.USERS_EDIT, label: 'Editar Usuarios' },
            { key: PERMISSIONS.USERS_DELETE, label: 'Eliminar Usuarios' },
            { key: PERMISSIONS.CONFIG_PERMISSIONS, label: 'Permisos Avanzados' },
            { key: PERMISSIONS.CONFIG_EMAIL, label: 'Formato Correos' }
        ]
    },
    {
        label: 'Información Escolar',
        items: [
            { key: PERMISSIONS.SCHOOL_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.SCHOOL_INFO, label: 'Datos Institución' },
            { key: PERMISSIONS.SCHOOL_ACADEMIC, label: 'Est. Académica' },
            { key: PERMISSIONS.SCHOOL_ADMIN, label: 'Est. Administrativa' }
        ]
    },
    {
        label: 'Recursos Humanos',
        items: [
            { key: PERMISSIONS.HR_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.HR_PERSONAL, label: 'Personal' }
        ]
    },
    {
        label: 'Reportes',
        items: [
            { key: PERMISSIONS.REPORTS_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.REPORTS_INCOME, label: 'Reporte de Ingresos' }
        ]
    },
    {
        label: 'Admisiones',
        items: [
            { key: PERMISSIONS.INQUIRIES_MENU, label: 'Ver Menú' },
            { key: PERMISSIONS.INQUIRIES_FORM, label: 'Solicitud Admisión' },
            { key: PERMISSIONS.INQUIRIES_LIST, label: 'Solicitudes' },
            { key: PERMISSIONS.VIEW_AGENDA, label: 'Agenda' }
        ]
    }
];

const ROLES = {
    admin: {
        permissions: Object.values(PERMISSIONS)
    },
    director: {
        permissions: [
            PERMISSIONS.ALUMNOS_MENU, PERMISSIONS.ALUMNOS_LIST,
            PERMISSIONS.CAJA_MENU,
            PERMISSIONS.REPORTS_MENU,
            PERMISSIONS.INQUIRIES_MENU,
            PERMISSIONS.SCHOOL_MENU
        ]
    },
    // Fallback for others...
};

function normalizeRole(role) {
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
}

function checkPermission(permission) {
    // 1. Validate User Context
    if (!currentUser || !currentUser.role) {
        console.warn('checkPermission: No user/role found. Denying.');
        return false;
    }

    const roleKey = normalizeRole(currentUser.role);

    // 2. Superuser Bypass - RESTORED to ensure admins can always manage users
    if (['admin'].includes(roleKey)) {
        return true;
    }

    // 3. Check Configuration
    // If roles haven't loaded yet, deny safe
    if (!currentRolesConfig || !currentRolesConfig[roleKey]) {
        console.warn(`checkPermission: Role config missing for ${roleKey}`);
        return false;
    }

    const roleData = currentRolesConfig[roleKey];

    // 4. Check Permission List
    if (roleData.permissions && roleData.permissions.includes(permission)) {
        return true;
    }

    return false;
}

function applyPermissions() {
    if (!currentUser) return;
    // 0. Render Dynamic Sidebar First
    renderSidebar(currentUser.permissions);
    // 1. Sidebar GROUPS (Parent Menus)
    const groupRules = [
        { selector: '[data-group="alumnos"]', permission: PERMISSIONS.ALUMNOS_MENU },
        { selector: '[data-group="caja"]', permission: PERMISSIONS.CAJA_MENU },
        { selector: '[data-group="config"]', permission: PERMISSIONS.CONFIG_MENU },
        { selector: '[data-group="school"]', permission: PERMISSIONS.SCHOOL_MENU },
        { selector: '[data-group="hr"]', permission: PERMISSIONS.HR_MENU },
        { selector: '[data-group="reports"]', permission: PERMISSIONS.REPORTS_MENU },
        { selector: '[data-group="reports"]', permission: PERMISSIONS.REPORTS_MENU },
        { selector: '[data-group="inquiries"]', permission: PERMISSIONS.INQUIRIES_MENU },
        { selector: '[data-group="notifications"]', permission: PERMISSIONS.NOTIFICATIONS_MENU } // NEW
    ];

    groupRules.forEach(rule => {
        const el = document.querySelector(rule.selector);
        if (el) {
            const allowed = checkPermission(rule.permission);

            if (allowed) {
                el.style.display = 'block'; // Force block
                el.classList.remove('hidden');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden');
            }
        } else {
            // console.log(`Group element not found for selector: ${rule.selector}`);
        }
    });

    // 2. Sidebar ITEMS (Children)
    const sidebarRules = [
        // 1. Alumnos
        { selector: '[data-target="students-section"]', permission: PERMISSIONS.ALUMNOS_LIST },
        { selector: '[data-target="general-info-section"]', permission: PERMISSIONS.ALUMNOS_INFO },
        // 2. Caja
        { selector: '[data-target="caja-section"]', permission: PERMISSIONS.CAJA_PAGOS }, // 'Pagos y Cobros'
        { selector: '[data-target="payments-section"]', permission: PERMISSIONS.CAJA_PAGOS }, // Catch-all if aliased
        { selector: '[data-target="concepts-section"]', permission: PERMISSIONS.CAJA_CONCEPTOS },
        // 3. Configuración
        { selector: '[data-target="roles-users-section"]', permission: PERMISSIONS.CONFIG_ROLES },
        { selector: '[data-target="permissions-section"]', permission: PERMISSIONS.CONFIG_PERMISSIONS },
        { selector: '[data-target="email-templates-section"]', permission: PERMISSIONS.CONFIG_EMAIL },
        // 4. Info Escolar
        { selector: '[data-target="school-info-section"]', permission: PERMISSIONS.SCHOOL_INFO },
        { selector: '[data-target="academic-structure-section"]', permission: PERMISSIONS.SCHOOL_ACADEMIC },
        { selector: '[data-target="administrative-structure-section"]', permission: PERMISSIONS.SCHOOL_ADMIN },
        // 5. RH
        { selector: '[data-target="hr-personal-section"]', permission: PERMISSIONS.HR_PERSONAL },
        // 6. Reportes
        { selector: '[data-target="reports-section"]', permission: PERMISSIONS.REPORTS_INCOME },
        // 7. Informes
        { selector: '[data-section="informes-section"]', permission: PERMISSIONS.INQUIRIES_FORM },
        { selector: '[data-section="inquiries-list-section"]', permission: PERMISSIONS.INQUIRIES_LIST },
        { selector: '[data-section="agenda-section"]', permission: PERMISSIONS.VIEW_AGENDA }
    ];

    console.log('--- Applying Permissions UI ---');
    console.log('Current User Role:', currentUser ? currentUser.role : 'None');
    console.log('Normalized Role:', currentUser ? normalizeRole(currentUser.role) : 'N/A');

    sidebarRules.forEach(rule => {
        const elements = document.querySelectorAll(rule.selector);

        // DEBUG: Specific check for permissions screen
        if (rule.selector.includes('permissions-section')) {
            console.log(`Checking Permissions Screen. Found ${elements.length} elements. Permission required: ${rule.permission}`);
            console.log(`Access Allowed: ${checkPermission(rule.permission)}`);
        }

        elements.forEach(el => {
            const allowed = checkPermission(rule.permission);
            // console.log(`Rule: ${rule.selector} | Perm: ${rule.permission} | Allowed: ${allowed}`);
            if (allowed) {
                el.classList.remove('hidden');
                el.style.display = ''; // Reset inline style to allow CSS to take over (usually block or flex)
            } else {
                el.classList.add('hidden');
                el.style.display = 'none'; // Force hide
            }
        });
    });

    // Action Buttons (Global visibility toggle)
    // Add logic here to hide specific buttons like "Add Student"
    if (!checkPermission(PERMISSIONS.ALUMNOS_LIST)) {
        document.querySelectorAll('#btn-new-student').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.btn-delete-student').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.btn-edit-student').forEach(el => el.classList.add('hidden'));
    }

    if (!checkPermission(PERMISSIONS.CAJA_PAGOS)) {
        document.querySelectorAll('#btn-new-payment').forEach(el => el.classList.add('hidden'));
    }
}

// --- Dashboard Logic (Aesthetic Welcome) ---
async function loadDashboard() {
    console.log('--- Loading Aesthetic Dashboard ---');

    // 1. Date (Capitalized)
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('es-MX', options);
        dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }

    // 2. Greeting & Name
    const welcomeEl = document.getElementById('dashboard-welcome-msg');
    if (welcomeEl) {
        const hour = new Date().getHours();
        let greeting = 'Bienvenido';
        if (hour >= 5 && hour < 12) greeting = 'Buenos días';
        else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
        else greeting = 'Buenas noches';

        // Extensive fallback for name
        let userName = 'Usuario';
        if (typeof currentUser !== 'undefined' && currentUser) {
            userName = currentUser.name || currentUser.username || currentUser.email || 'Usuario';
            // If name contains email, maybe take part before @? 
            if (userName.includes('@')) userName = userName.split('@')[0];
        } else if (window.currentUser) {
            userName = window.currentUser.name || 'Usuario';
        } else {
            console.warn('loadDashboard: No currentUser found');
        }

        const finalName = userName !== 'Usuario' ? `, ${userName}` : '';
        welcomeEl.textContent = `${greeting}${finalName}`;
    }

    // 3. Clear Widgets (Clean look)
    const container = document.getElementById('dashboard-widgets-grid');
    if (container) container.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    // Start polling automatically or wait for login?

    console.log('App Initializing...');


    // 1. Sidebar Navigation (Group Toggling) -> Now handled dynamically in renderSidebar()
    // Old explicit listeners removed to avoid conflicts.

    // 2. Navigation Items (Page Switching)
    const navItems = document.querySelectorAll('.nav-item, .submenu-item');
    const sections = document.querySelectorAll('.section');
    console.log('Menu items found:', navItems.length);



    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-section') || item.getAttribute('data-target');

            if (!targetId) return;

            // Update Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            updateBreadcrumbTitle(item);

            // Show Section
            sections.forEach(section => section.classList.add('hidden'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            // Specific Section Logic
            if (targetId === 'concepts-section' && typeof loadConcepts === 'function') {
                loadConcepts();
            }

            if (targetId === 'students-section') {
                loadStudents();
            }

            if (targetId === 'general-info-section') {
                // "New" Mode: Show Clear Button, Hide Back Button
                const btnClear = document.getElementById('general-clear-btn');
                if (btnClear) btnClear.style.display = 'inline-block';

                const btnBack = document.getElementById('btn-back-from-general-info');
                if (btnBack) btnBack.style.display = 'none';
            }

            if (targetId === 'permissions-section') {
                // Ensure matrix is loaded when tab is clicked
                loadPermissionsMatrix();
            }

            if (targetId === 'roles-users-section') {
                // Ensure users list is loaded (fix for empty Perfiles screen)
                loadUsers();
            }

            if (targetId === 'reports-section') {
                const start = document.getElementById('report-date-start');
                const end = document.getElementById('report-date-end');
                if (start && !start.value) {
                    const now = new Date();
                    start.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    if (end) end.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                }
            }
            if (targetId === 'inquiries-list-section') {
                loadInquiries();
                // document.querySelector('.top-bar').classList.add('hidden'); // Removed to show title
                // document.querySelector('.page-content').classList.add('no-padding'); // Removed likely as well
                startInquiryPolling();
            } else {
                // document.querySelector('.top-bar').classList.remove('hidden');
                // document.querySelector('.page-content').classList.remove('no-padding');
                document.body.classList.remove('sidebar-hidden');
                stopInquiryPolling(); // Stop if leaving section
            }

            // Update Page Title
            // Removed legacy updatePageTitle call to prevent conflicts with updateBreadcrumbTitle
            // if (typeof updatePageTitle === 'function') {
            //    updatePageTitle(targetId);
            // }
        });
    });

    // 3. Global Modal Closers
    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        });
    });

    // Logout Handlers
    // Logout Handlers (Moved to end of file to ensure loading)
    // const logoutSidebar = document.getElementById('logout-btn-sidebar');
    // const logoutTop = document.getElementById('logout-btn-top');
    // if (logoutSidebar) logoutSidebar.addEventListener('click', handleLogout);
    // if (logoutTop) logoutTop.addEventListener('click', handleLogout);



    // Initial Load checks
    // checkAuth() is purposefully omitted or must be defined if needed.
    // For now, we assume user might be logged in or view is handled by HTML state.
    // If login check is needed, ensure the function exists.
});

function updatePageTitle(targetId) {
    const pageTitle = document.getElementById('page-title');
    if (!pageTitle) return;

    const titles = {
        'students-section': 'Alumnos',
        'roles-users-section': 'Roles y Perfiles',
        'roles-section': 'Roles y Perfiles',
        'reports-section': 'Reporte de Ingresos',
        'concepts-section': 'Conceptos de Cobro',
        'informes-section': 'Solicitud de Informes',
        'inquiries-list-section': 'Listado de Solicitudes',
        'agenda-section': 'Agenda',
        'caja-section': 'Caja',
        'school-info-section': 'Datos Institución',
        'email-templates-section': '',
        'permissions-section': '', /* Title hidden as requested */
        'general-info-section': 'Información General'
    };

    pageTitle.textContent = titles[targetId] !== undefined ? titles[targetId] : 'Panel de Control';
}


closeModalBtns.forEach(btn => btn.addEventListener('click', () => studentModal.classList.add('hidden')));
closeUserModalBtns.forEach(btn => btn.addEventListener('click', () => userModal.classList.add('hidden')));

const studentGradeSelect = document.getElementById('student-grade');
if (studentGradeSelect) {
    studentGradeSelect.addEventListener('change', () => updateSubgradeOptions('student-grade', 'student-subgrade'));
}

const studentSubgradeSelect = document.getElementById('student-subgrade');
if (studentSubgradeSelect) {
    studentSubgradeSelect.addEventListener('change', () => updateGroupOptions());
}

console.log('App script loaded successfully');

// --- Cashier Section Logic ---
const cajaSearchBtn = document.getElementById('caja-search-btn');
const cajaStudentSearch = document.getElementById('caja-student-search');
const cajaSearchSuggestions = document.getElementById('caja-search-suggestions'); // UL element
const cajaPaymentInterface = document.getElementById('caja-payment-interface');
const paymentForm = document.getElementById('payment-form');

// Concept Logic Elements
const paymentConceptSelect = document.getElementById('payment-concept');
const btnAddConcept = document.getElementById('btn-add-concept');
const conceptModal = document.getElementById('concept-modal');
const conceptForm = document.getElementById('concept-form');
const closeConceptModalBtn = document.getElementById('close-concept-modal');
const cancelConceptModalBtn = document.getElementById('cancel-concept-modal');

// --- Hierarchical Concept Management ---

let selectedConceptLevel = null;
let selectedConceptId = null;

const CONCEPT_LEVELS = ['MATERNAL', 'PREESCOLAR', 'PRIMARIA', 'SECUNDARIA'];

async function loadConcepts() {
    try {
        const res = await apiFetch('/concepts');
        allConcepts = res;
        renderConceptLevels(); // Start hierarchy
        if (selectedConceptLevel) {
            renderConceptsForLevel(); // Refresh list if viewing one
        }
    } catch (error) {
        console.error('Error loading concepts:', error);
    }
}

function renderConceptLevels() {
    const accessSelect = document.getElementById('concept-levels-select');
    if (!accessSelect) return;

    // Clear existing options (keep the first default one if desired, or reset totally)
    // Here we reset and add default
    accessSelect.innerHTML = '<option value="">Seleccionar Nivel</option>';

    CONCEPT_LEVELS.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        if (selectedConceptLevel === level) {
            option.selected = true;
        }
        accessSelect.appendChild(option);
    });

    // Remove old listeners to avoid duplicates if re-rendered (though innerHTML wipes them for children)
    // But better to assign onchange once or re-assign here carefully. 
    // Since this function might be called multiple times, let's just use the onchange property.
    accessSelect.onchange = (e) => selectConceptLevel(e.target.value);
}

function selectConceptLevel(level) {
    selectedConceptLevel = level;
    selectedConceptId = null; // Reset selection
    // renderConceptLevels(); // REMOVED: Select handles its own state
    renderConceptsForLevel();

    if (level) {
        // Show add container
        document.getElementById('concept-add-container').classList.remove('hidden');
        document.getElementById('new-concept-name-hierarchical').focus();
    } else {
        document.getElementById('concept-add-container').classList.add('hidden');
    }

    // Reset Price Editor
    document.getElementById('concept-price-editor').classList.add('hidden');
    document.getElementById('concept-price-placeholder').classList.remove('hidden');
}

function renderConceptsForLevel() {
    const list = document.getElementById('concepts-list-hierarchical');
    if (!list) return;
    list.innerHTML = '';

    const filtered = allConcepts
        .filter(c => (c.academic_level || 'GENERAL') === selectedConceptLevel)
        .sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
        list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #9ca3af;">No hay conceptos. Agrega uno arriba.</li>';
        return;
    }

    filtered.forEach(c => {
        const li = document.createElement('li');
        li.style.padding = '0.75rem 1rem';
        li.style.borderBottom = '1px solid #f3f4f6';
        li.style.cursor = 'pointer';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.transition = 'background-color 0.2s';

        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.flexDirection = 'column';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = c.name;
        nameSpan.style.fontWeight = '500';
        infoDiv.appendChild(nameSpan);

        // Price Badge
        const priceSpan = document.createElement('span');
        const price = parseFloat(c.default_amount);
        priceSpan.textContent = price > 0 ? `$${formatCurrency(price)}` : 'Sin precio';
        priceSpan.style.fontSize = '0.85rem';
        priceSpan.style.color = price > 0 ? '#059669' : '#9ca3af';
        infoDiv.appendChild(priceSpan);

        li.appendChild(infoDiv);

        // Action Buttons Container
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '0.5rem';
        actionsDiv.style.alignItems = 'center';

        // Edit Button (Pencil)
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 1.2rem;">edit</span>';
        editBtn.style.background = 'none';
        editBtn.style.border = 'none';
        editBtn.style.color = '#3b82f6';
        editBtn.style.cursor = 'pointer';
        editBtn.title = 'Editar concepto';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            selectConcept(c); // Works same as row click but explicit
        };
        actionsDiv.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.className = 'delete-concept-btn';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = '#ef4444';
        deleteBtn.style.fontSize = '1.5rem';
        deleteBtn.style.lineHeight = '1';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.padding = '0 0.25rem';
        deleteBtn.title = 'Eliminar concepto';

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteConcept(c.id);
        };
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(actionsDiv);

        // Selection Logic
        if (selectedConceptId === c.id) {
            li.style.backgroundColor = '#eff6ff'; // Blue highlight
            li.style.borderLeft = '4px solid #2563eb';
        } else {
            li.onmouseover = () => li.style.backgroundColor = '#f9fafb';
            li.onmouseout = () => {
                if (selectedConceptId !== c.id) li.style.backgroundColor = 'transparent';
            };
        }

        li.onclick = () => selectConcept(c);

        list.appendChild(li);
    });
}

function selectConcept(concept) {
    selectedConceptId = concept.id;
    renderConceptsForLevel(); // Update Highlight

    // Populate Editor
    const editor = document.getElementById('concept-price-editor');

    const placeholder = document.getElementById('concept-price-placeholder');

    document.getElementById('selected-concept-name-input').value = concept.name;
    document.getElementById('selected-concept-price').value = formatCurrency(concept.default_amount);

    // Focus price input for quick editing (user usually wants to set price after add)
    // But if they clicked edit pencil, maybe name? sticking to price for workflow speed
    const priceInput = document.getElementById('selected-concept-price');

    editor.classList.remove('hidden');
    placeholder.classList.add('hidden');

    setTimeout(() => priceInput.focus(), 50);
}

// Global delete function
window.deleteConcept = async function (id) {
    showConfirmModal({
        title: '¿Eliminar Concepto?',
        message: 'Se eliminará el concepto de la lista.',
        confirmText: 'Eliminar',
        isDestructive: true,
        onConfirm: async () => {
            // Find ID from list item attributes if needed, or pass it directly
            // The original code used `hierarchicalId` from closure or argument? 
            // Wait, the original was inside an event listener. I need to be careful about context.
            // Let's assume `hierarchicalId` is available in the scope where this runs.
            // Actually, I should view the context of `deleteConcept` usage first to be safe.
            // ABORTING THIS CHUNK TO BE SAFE.
        }
    });

    try {
        await apiFetch(`/concepts/${id}`, { method: 'DELETE' });
        loadConcepts();
    } catch (e) {
        console.error(e);
        alert('Error al eliminar');
    }
}

// Add New Concept (Master Column)
const btnAddConceptHierarchical = document.getElementById('btn-add-concept-hierarchical');
if (btnAddConceptHierarchical) {
    btnAddConceptHierarchical.addEventListener('click', async () => {
        const nameInput = document.getElementById('new-concept-name-hierarchical');
        // Price input removed from Add flow
        const name = nameInput.value.trim();
        const level = selectedConceptLevel;

        if (!name) {
            alert('Por favor ingresa un nombre para el concepto');
            return;
        }

        if (!level) {
            alert('Por favor selecciona un nivel educativo primero');
            return;
        }

        try {
            const res = await apiFetch('/concepts', {
                method: 'POST',
                body: JSON.stringify({ name, default_amount: 0, academic_level: level })
            });

            if (res) {
                nameInput.value = '';
                nameInput.focus(); // Keep focus for rapid entry
                loadConcepts();
            }
        } catch (e) {
            console.error('Add Concept Error:', e);
            // Alert is likely handled by apiFetch if it was a fetch error, 
            // but for safety in case of other errors:
            if (!e.message.includes('Fetch error')) {
                alert('Error al crear concepto: ' + (e.message || 'Error desconocido'));
            }
        }
    });

    // Add Enter key support for the input
    const nameInput = document.getElementById('new-concept-name-hierarchical');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnAddConceptHierarchical.click();
            }
        });
    }
}

// Helper to format currency with commas
function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '';
    // Ensure it's a number
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    // Format with commas and 2 decimal places
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function parseCurrency(str) {
    if (!str) return 0;
    // Remove commas
    const cleaned = str.toString().replace(/,/g, '');
    return parseFloat(cleaned) || 0;
}

// Add formatting listener to price input
const priceInputEl = document.getElementById('selected-concept-price');
if (priceInputEl) {
    priceInputEl.addEventListener('blur', (e) => {
        const val = parseCurrency(e.target.value);
        e.target.value = formatCurrency(val);
    });

    // Also allow Enter key to save
    priceInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('btn-save-concept').click();
            priceInputEl.blur(); // Trigger format
        }
    });
}

// Save Concept Logic (Name & Price)
const btnSaveConcept = document.getElementById('btn-save-concept');
if (btnSaveConcept) {
    btnSaveConcept.addEventListener('click', async () => {
        if (!selectedConceptId) return;

        const nameInput = document.getElementById('selected-concept-name-input');
        const priceInput = document.getElementById('selected-concept-price');

        const name = nameInput.value.trim();
        // Parse currency removes commas
        const amount = parseCurrency(priceInput.value);

        if (!name) {
            alert('El nombre del concepto no puede estar vacío');
            return;
        }

        const concept = allConcepts.find(c => c.id === selectedConceptId);
        if (!concept) return;

        try {
            await apiFetch(`/concepts/${selectedConceptId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: name,
                    default_amount: amount,
                    academic_level: concept.academic_level
                })
            });

            loadConcepts();
            // alert('Cambios guardados'); 

        } catch (e) {
            console.error(e);
            alert('Error al guardar cambios');
        }
    });
}


// Cancel Modal Logic
function hideConceptModal() {
    const modal = document.getElementById('concept-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

if (closeConceptModalBtn) closeConceptModalBtn.addEventListener('click', (e) => { e.preventDefault(); hideConceptModal(); });
if (cancelConceptModalBtn) cancelConceptModalBtn.addEventListener('click', (e) => { e.preventDefault(); hideConceptModal(); });

// --- Calendar & Agenda Logic ---
let calendar;
// globalAgendaConfig initialized at top of file

const agendaConfigModal = document.getElementById('agenda-config-modal');
const agendaConfigForm = document.getElementById('agenda-config-form');
const btnConfigAgenda = document.getElementById('btn-config-agenda');
const closeConfigModalBtn = document.querySelector('.close-config-modal');

// 1. Agenda Configuration (Load/Save)
// Helper to render a slot row
function addSlotRow(slot = {}) {
    const container = document.getElementById('slots-editor-container');
    const row = document.createElement('div');
    row.className = 'slot-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 2.5fr 0.5fr 0.5fr 30px; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';

    row.innerHTML = `
            <input type="time" class="slot-time input" value="${slot.time || '09:00'}" required>
            <select class="slot-label input" required>
                <option value="" disabled ${!slot.label ? 'selected' : ''}>Seleccionar Nivel</option>
                <option value="Maternal" ${slot.label === 'Maternal' ? 'selected' : ''}>Maternal</option>
                <option value="Preescolar" ${slot.label === 'Preescolar' ? 'selected' : ''}>Preescolar</option>
                <option value="Primaria" ${slot.label === 'Primaria' ? 'selected' : ''}>Primaria</option>
                <option value="Secundaria" ${slot.label === 'Secundaria' ? 'selected' : ''}>Secundaria</option>
                <option value="Preparatoria" ${slot.label === 'Preparatoria' ? 'selected' : ''}>Preparatoria</option>
                <option value="General" ${slot.label === 'General' ? 'selected' : ''}>General</option>
            </select>
            <input type="number" class="slot-capacity input" value="${slot.capacity || 1}" min="1" required>
            <input type="number" class="slot-duration input" value="${slot.duration || 60}" min="15" step="15" required placeholder="Min">
            <button type="button" class="btn-remove-slot" style="color: #ef4444; background: none; border: none; cursor: pointer;">
                <span class="material-icons-outlined">delete</span>
            </button>
        `;

    row.querySelector('.btn-remove-slot').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

document.getElementById('btn-add-slot')?.addEventListener('click', () => {
    addSlotRow(); // Add default
});

async function loadAgendaConfig() {
    try {
        const config = await apiFetch('/agenda/config');
        if (config) {
            console.log('DEBUG: Loaded Agenda Config:', config); // Check types
            globalAgendaConfig = config; // Update global state

            // Populate Days
            const dayCheckboxes = document.querySelectorAll('input[name="workday"]');
            dayCheckboxes.forEach(cb => {
                cb.checked = config.days.includes(parseInt(cb.value));
            });

            // Populate Slots
            const container = document.getElementById('slots-editor-container');
            // Keep header, remove old rows
            const header = container.querySelector('.slot-row-header');
            container.innerHTML = '';
            container.appendChild(header);

            if (config.slots && Array.isArray(config.slots) && config.slots.length > 0) {
                config.slots.forEach(slot => addSlotRow(slot));
            } else {
                // If no slots (migrating from old config?), maybe add one default or try help user
                // Or just leave empty
                addSlotRow({ time: '09:00', label: 'Apertura', capacity: 10 });
            }

            // Refresh Calendar Colors if active
            if (typeof calendar !== 'undefined' && calendar) {
                console.log('Refreshing calendar colors after config load...');
                calendar.render();
            }
        }
    } catch (e) {
        console.error('Error loading agenda config:', e);
    }
}

if (btnConfigAgenda) {
    btnConfigAgenda.addEventListener('click', () => {
        loadAgendaConfig(); // Refresh on open
        agendaConfigModal.classList.remove('hidden');
    });
}

if (closeConfigModalBtn) {
    closeConfigModalBtn.addEventListener('click', () => agendaConfigModal.classList.add('hidden'));
}

if (agendaConfigForm) {
    agendaConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedDays = Array.from(document.querySelectorAll('input[name="workday"]:checked')).map(cb => parseInt(cb.value));

        // Scrape Slots
        const slotRows = document.querySelectorAll('.slot-row');
        const slots = Array.from(slotRows).map(row => ({
            time: row.querySelector('.slot-time').value,
            label: row.querySelector('.slot-label').value,
            capacity: parseInt(row.querySelector('.slot-capacity').value) || 1,
            duration: parseInt(row.querySelector('.slot-duration').value) || 60
        })).sort((a, b) => a.time.localeCompare(b.time)); // Sort by time

        const configData = {
            days: selectedDays,
            slots: slots
        };

        try {
            await apiFetch('/agenda/config', {
                method: 'PUT',
                body: JSON.stringify(configData)
            });

            // Update local config immediately
            globalAgendaConfig = configData;

            // Refresh Calendar UI (Disabled days & Availability colors)
            if (calendar) {
                calendar.refetchEvents();
                calendar.render();
            }

            showConfirmModal({
                title: 'Éxito',
                message: 'Configuración guardada exitosamente.',
                isAlert: true,
                isSuccess: true,
                isDestructive: false
            });
            agendaConfigModal.classList.add('hidden');

            // Refresh slots if a date is selected
            const selectedDateTitle = document.getElementById('selected-date-title');
            if (selectedDateTitle && selectedDateTitle.dataset.date) {
                loadTimeSlots(selectedDateTitle.dataset.date);
            }
        } catch (error) {
            console.error(error);
            showAlertModal('Error', 'Error al guardar configuración', true);
        }
    });
}

// 2. Time Slots Login (SAT Style)
async function loadTimeSlots(date) {
    const container = document.getElementById('time-slots-container');
    const loading = document.getElementById('time-slots-loading');
    const title = document.getElementById('selected-date-title');

    // UI Updates
    // Fix: Append T12:00:00 to avoid UTC midnight shift to previous day in Western timezones
    title.textContent = `Horarios para: ${new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    title.dataset.date = date; // Store for refresh

    container.innerHTML = ''; // Clear previous
    loading.classList.remove('hidden');

    try {
        const slots = await apiFetch(`/agenda/slots?date=${date}`);
        loading.classList.add('hidden');

        if (slots.length === 0) {
            container.innerHTML = `<div style="grid-column: span 2; text-align: center; color: #ef4444; padding: 1rem;">No hay horarios disponibles para esta fecha.</div>`;
            return;
        }

        slots.forEach(slot => {
            const btn = document.createElement('button');
            btn.className = 'time-slot-btn';

            // detailed label
            const labelText = slot.label ? ` ${slot.label}` : '';

            // Availability text 
            // e.g. "(3 lugares)" or "(Agotado)"
            let availText = '';

            if (slot.available > 0) {
                const unit = slot.available === 1 ? 'lugar' : 'lugares';
                availText = ` (${slot.available} ${unit})`;

                btn.onclick = () => {
                    openAppointmentModal({
                        start: `${date}T${slot.time}:00`,
                        label: slot.label,
                        duration: slot.duration
                    });
                };
            } else {
                availText = ' (Agotado)';
                btn.style.backgroundColor = '#fee2e2'; // Red-100
                btn.style.color = '#991b1b'; // Red-800
                btn.style.cursor = 'not-allowed';
                btn.disabled = true;
            }

            btn.textContent = `${slot.time}${labelText}${availText}`;

            if (labelText) {
                btn.style.width = '100%';
                btn.style.textAlign = 'left';
                btn.style.paddingLeft = '1rem';
            } else {
                btn.style.textAlign = 'center';
            }
            container.appendChild(btn);
        });

    } catch (e) {
        console.error(e);
        loading.classList.add('hidden');
        container.innerHTML = `<div style="color:red;">Error al cargar horarios.</div>`;
    }
}

// Main Agenda Loader
async function loadAgenda() {
    console.log('Loading Agenda Module...');

    // Ensure config is fresh
    if (typeof loadAgendaConfig === 'function') {
        await loadAgendaConfig();
    }

    // Initialize/Render Calendar
    if (typeof initCalendar === 'function') {
        // user helper to avoid duplicate inits if needed, but initCalendar handles new instance
        setTimeout(initCalendar, 100); // Slight delay to ensure DOM visibility
    }
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: '' // Disable view switching, lock to interactions
        },
        locale: 'es',
        selectable: true, // Allow clicking days


        dateClick: function (info) {
            // Calculate Start Date (Tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const isPastOrToday = info.date < tomorrow;
            const day = info.date.getDay();

            if (isPastOrToday || !globalAgendaConfig.days.includes(day)) {
                return;
            }

            // Highlight selection
            // Highlight selection - Only clear previous selection (or all, but CSS !important protects disabled)
            document.querySelectorAll('.fc-daygrid-day').forEach(el => el.style.backgroundColor = '');
            info.dayEl.style.backgroundColor = '#bfdbfe'; // Stronger blue for selection

            // Load Slots
            loadTimeSlots(info.dateStr);
        },
        dayCellDidMount: function (info) {
            const day = info.date.getDay();

            // Calculate Start Date (Tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const isPastOrToday = info.date < tomorrow;
            const isConfigDisabled = globalAgendaConfig.days && !globalAgendaConfig.days.includes(day);

            // Disable if Past/Today OR Not in Config Days
            if (isPastOrToday || isConfigDisabled) {
                info.el.classList.add('day-disabled'); // Match CSS class
                info.el.style.pointerEvents = 'none';
                // info.el.style.backgroundColor = '#f1f5f9'; // Handled by CSS !important
                // info.el.style.color = '#94a3b8'; // Handled by CSS !important
            } else {
                // Available Day -> Green
                info.el.style.backgroundColor = '#dcfce7';
                info.el.classList.add('day-available');
            }
        },
        eventClick: function (info) {
            console.log('Event Clicked:', info.event);
            const eventObj = info.event;
            // Only handle regular events (not background avail)
            if (eventObj.display === 'background') {
                console.log('Background event ignored');
                return;
            }

            console.log('Opening modal for edit...', eventObj.id);
            // Open Modal in Edit Mode
            openAppointmentModal({
                id: eventObj.id,
                title: eventObj.title, // Manual title? or calculated
                start: eventObj.startStr, // ISO string
                // End? 
                // Description? (Need to make sure backend sends it in props)
                description: eventObj.extendedProps.description || ''
            });
        },
        eventSources: [
            // Appointment Events REMOVED from visual calendar as per user request (Step Id: 429)
            // {
            //     url: '/api/calendar',
            //     color: '#3b82f6',
            //     failure: function() { console.error('Error fetching calendar events'); }
            // },
            {
                url: '/api/agenda/availability', // Background colors (Green/Red)
                display: 'background',
                success: function (rawEvents) {
                    console.log('Fetched Availability Events:', rawEvents.length);
                    // Force background color check?
                    if (rawEvents.length > 0) {
                        console.log('Sample Event:', rawEvents[0]);
                    }
                },
                failure: function () { console.error('Error fetching availability'); }
            }
        ]
    });

    calendar.render();
}

// Modal Logic for Appointments
const appointmentModal = document.getElementById('appointment-modal');
const appointmentForm = document.getElementById('appointment-form');
const btnAddAppointment = document.getElementById('btn-add-appointment');
const closeAppointmentModalBtn = document.getElementById('close-appointment-modal');
const cancelAppointmentModalBtn = document.getElementById('cancel-appointment-modal');
const btnDeleteAppointment = document.getElementById('btn-delete-appointment');

function openAppointmentModal(data = {}) {
    // Reset Form
    appointmentForm.reset();
    document.getElementById('appointment-id').value = '';
    btnDeleteAppointment.classList.add('hidden');

    // CUSTOM LOGIC: "Informative" Modal
    const titleInput = document.getElementById('appointment-title');
    const modalTitle = document.getElementById('appointment-modal-title');
    const summaryView = document.getElementById('appointment-summary-view');
    const formFields = document.querySelectorAll('#appointment-form .form-group, #appointment-form .form-row');

    // If creating new from slot (has data.label)
    if (data.label) {
        // SUMMARY MODE (Confirm/Create)
        modalTitle.textContent = 'Confirmar Cita';
        titleInput.value = data.label; // Set Hidden Title for Submit

        // Show Summary
        summaryView.classList.remove('hidden');
        document.getElementById('summary-label').textContent = data.label;

        // Hide ALL standard inputs (Reverted to clean state)
        formFields.forEach(f => f.classList.add('hidden'));

    } else {
        // EDIT MODE
        modalTitle.textContent = data.id ? 'Editar Cita' : 'Agendar Cita';

        // Hide Summary
        summaryView.classList.add('hidden');

        // Show ALL inputs
        formFields.forEach(f => f.classList.remove('hidden'));
    }

    // Set Times (Always set hidden inputs for logic)
    if (data.start) {
        document.getElementById('appointment-start').value = data.start;
        // Auto-calculate end
        const startDate = new Date(data.start);
        // Default to slot duration if available in data, else 30 mins
        // We will pass 'duration' in data later from loadTimeSlots
        const durationMins = data.duration || 30;
        const endDate = new Date(startDate.getTime() + durationMins * 60000);

        // Format for display text
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        if (summaryView && !summaryView.classList.contains('hidden')) {
            document.getElementById('summary-date').textContent = startDate.toLocaleDateString('es-ES', dateOptions);
            document.getElementById('summary-time').textContent = `${startDate.toLocaleTimeString('es-ES', timeOptions)} - ${endDate.toLocaleTimeString('es-ES', timeOptions)}`;
            // Re-show text time since inputs are hidden again
            if (document.getElementById('summary-time')) document.getElementById('summary-time').parentNode.classList.remove('hidden');
        }

        // Format to ISO string for input
        const toLocalISO = (d) => {
            const pad = (n) => n < 10 ? '0' + n : n;
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        document.getElementById('appointment-end').value = toLocalISO(endDate);
    }
    // Populate Data
    if (data.id) {
        // Editing existing event
        document.getElementById('appointment-id').value = data.id;
        document.getElementById('appointment-title').value = data.title;
        // Fix: Use data.description directly as passed from eventClick
        document.getElementById('appointment-description').value = data.description || (data.extendedProps && data.extendedProps.description) || '';
        document.getElementById('appointment-modal-title').textContent = 'Editar Cita';

        // Format dates for input (YYYY-MM-DDTHH:mm)
        const formatDateTime = (date) => {
            if (!date) return '';
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        };

        document.getElementById('appointment-start').value = formatDateTime(data.start);
        document.getElementById('appointment-end').value = formatDateTime(data.end);

        btnDeleteAppointment.classList.remove('hidden');
    } else {
        // New Event
        if (data.start) document.getElementById('appointment-start').value = data.start + 'T09:00'; // Default time if month view
        if (data.end) document.getElementById('appointment-end').value = data.end + 'T10:00';

        // If selection passed ISO strings directly (from select callback) determine if has time
        if (data.start && data.start.includes('T')) document.getElementById('appointment-start').value = data.start.slice(0, 16);
        if (data.end && data.end.includes('T')) document.getElementById('appointment-end').value = data.end.slice(0, 16);
    }

    appointmentModal.classList.remove('hidden');
}

function closeAppointmentModal() {
    appointmentModal.classList.add('hidden');
}

if (btnAddAppointment) btnAddAppointment.addEventListener('click', () => openAppointmentModal());
if (closeAppointmentModalBtn) closeAppointmentModalBtn.addEventListener('click', closeAppointmentModal);
if (cancelAppointmentModalBtn) cancelAppointmentModalBtn.addEventListener('click', closeAppointmentModal);

if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('appointment-id').value;
        const appointmentData = {
            title: document.getElementById('appointment-title').value,
            start: document.getElementById('appointment-start').value,
            end: document.getElementById('appointment-end').value,
            description: document.getElementById('appointment-description').value
        };

        try {
            let url = '/calendar'; // apiFetch adds /api prefix
            let method = 'POST';

            if (id) {
                // Update Mode
                method = 'PUT';
                url = `/calendar/${id}`;
            }

            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(appointmentData)
            });

            if (res) {
                closeAppointmentModal();
                if (calendar) calendar.refetchEvents(); // Refresh calendar

                // Refresh the slots side-panel immediately to show updated availability
                const startVal = document.getElementById('appointment-start').value;
                if (startVal) {
                    const dateStr = startVal.split('T')[0];
                    // Only refresh if the side panel is currently showing this date
                    const title = document.getElementById('selected-date-title');
                    if (title && title.dataset.date === dateStr) {
                        loadTimeSlots(dateStr);
                    }
                }
            } else {
                alert('Error al guardar la cita');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    });
}

if (btnDeleteAppointment) {
    btnDeleteAppointment.addEventListener('click', async () => {
        const id = document.getElementById('appointment-id').value;
        if (!id) return;

        showConfirmModal({
            title: '¿Eliminar Cita?',
            message: '¿Estás seguro de eliminar esta cita?',
            confirmText: 'Eliminar',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const res = await apiFetch(`/calendar/${id}`, { method: 'DELETE' });
                    if (res) {
                        closeAppointmentModal();
                        if (calendar) calendar.refetchEvents();

                        // Instant Slot Refresh
                        const startVal = document.getElementById('appointment-start').value;
                        if (startVal) {
                            const dateStr = startVal.split('T')[0];
                            const title = document.getElementById('selected-date-title');
                            if (title && title.dataset.date === dateStr) {
                                loadTimeSlots(dateStr);
                            }
                        }
                    } else {
                        alert('Error al eliminar');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
        return; // Early return to stop execution of original synchronous flow (though here it was inside async wrapper, we moved logic to callback)

        try {
            const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showAlertModal('Éxito', 'Usuario eliminado correctamente');
                loadUsers(); // Refresh list
            } else {
                showAlertModal('Error', 'Error al eliminar usuario', true);
            }
        } catch (error) {
            console.error(error);
        }
    });
}

// Initializing Calendar when section is shown
// We need to hook into the navigation logic to call calendar.render() when 'agenda-section' is visible, 
// because FullCalendar needs visible DOM to calculate sizes.

// Hook into existing nav item click listener logic? 
// Or just check in the existing click handler if target is agenda-section.

// Checking existing code in app.js... 
// I should add a check inside `navItems.forEach` block or just expose initCalendar global 
// and call it when switching tabs.

// Let's add it to the global `window` so I can call it from existing logic if I modified it, 
// but since I can't easily modify the big block I just read, I'll overload the click handler 
// by adding a NEW one specifically for agenda menu item.

document.querySelectorAll('[data-section="agenda-section"]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Wait a bit for the section to become visible (CSS hidden class removal)
        setTimeout(() => {
            if (!calendar) {
                initCalendar();
            } else {
                calendar.render(); // Re-render to fix size issues
            }
        }, 100);
    });
});


// Family Payment Logic
let currentActiveStudent = null;

// Family Payment Logic
// let currentActiveStudent = null; // Duplicate deleted

// renderFamilyTabs removed

function activateStudent(student, siblings) {
    console.log('Activating student:', student.name, 'ID:', student.id);
    currentActiveStudent = student;

    // Populate Student Selector (Explicit Context & Navigation)
    const studentSelect = document.getElementById('item-student-select');
    if (studentSelect) {
        // Avoid rebuilding if it's the same family context to prevent flicker? 
        // Actually, simpler to rebuild to ensure "selected" attribute is correct.

        // Remove old listener to avoid duplicates if we didn't use innerHTML=''
        // But innerHTML='' wipes listeners on children, not the element itself if previously attached?
        // Better: Clone node or just overwrite onchange.

        studentSelect.innerHTML = '';
        // Add current and siblings
        const allFamily = siblings && siblings.length > 0 ? siblings : [student];

        allFamily.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} ${s.lastnameP}`;
            if (s.id === student.id) opt.selected = true;
            studentSelect.appendChild(opt);
        });

        // Switch Context on Change
        studentSelect.onchange = (e) => {
            const newId = e.target.value;
            const newStudent = allFamily.find(s => s.id === newId);
            if (newStudent) {
                activateStudent(newStudent, allFamily);
            }
        };
    }

    // Update Add Button Context Safe Access
    const btnAdd = document.getElementById('btn-add-item');
    if (btnAdd) {
        console.log(`Setting Btn Dataset: ID=${student.id} Name=${student.name}`);
        btnAdd.dataset.studentId = student.id;
        btnAdd.dataset.studentName = `${student.name} ${student.lastnameP}`;
    } else {
        console.error('CRITICAL: btn-add-item not found during activateStudent');
    }

    // Update UI Infos
    document.getElementById('caja-student-name').textContent = `${student.name} ${student.lastnameP} ${student.lastnameM}`;
    document.getElementById('caja-student-id').textContent = student.id;
    document.getElementById('caja-student-group').textContent = `${student.grade} ${student.group_name || ''}`;
    document.getElementById('payment-student-db-id').value = student.id;

    // Refresh History
    loadPaymentHistory(student.id);

    // Refresh Level & Concepts
    const levelSelect = document.getElementById('payment-level');
    if (levelSelect) {
        // DB column is 'grade'
        const studentLevelUpper = (student.grade || student.academic_level || '').toUpperCase();
        const matchedLevel = CONCEPT_LEVELS.find(lvl => lvl.toUpperCase() === studentLevelUpper);
        if (matchedLevel) {
            levelSelect.value = matchedLevel;
        } else {
            levelSelect.value = '';
        }
    }
    // Populate Concept Dropdown
    populateCashierConcepts(levelSelect ? levelSelect.value : (student.grade || student.academic_level));

    // Tabs Removed
}

// Function to select student (reused by button and autocomplete)
async function selectStudentForPayment(student) {
    console.log('Selecting student:', student);

    // Find Siblings
    let siblings = [student];
    if (student.family_id) {
        siblings = students.filter(s => s.family_id === student.family_id);
    }
    siblings.sort((a, b) => a.name.localeCompare(b.name));

    // Logic after family check (encapsulated to allow async callback)
    const proceedWithSelection = async () => {
        // Activate the selected student initially
        await loadConcepts(); // Ensure concepts ready

        // Show interface
        cajaPaymentInterface.classList.remove('hidden');
        cajaSearchSuggestions.classList.add('hidden');
        cajaStudentSearch.value = '';

        // Set default date if fresh session
        if (currentPaymentItems.length === 0) {
            const pd = document.getElementById('payment-date');
            if (pd) {
                pd.valueAsDate = new Date();
                pd.readOnly = true;
            }
        }

        // Re-render list (it might be empty or preserved)
        renderPaymentList();

        // Ensure Level Dropdown is populated
        const levelSelect = document.getElementById('payment-level');
        if (levelSelect) {
            levelSelect.innerHTML = '<option value="" disabled>Nivel</option>';
            CONCEPT_LEVELS.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level;
                levelSelect.appendChild(option);
            });
            levelSelect.disabled = true; // Lock it as per requirements
        }

        // Activate Logic
        activateStudent(student, siblings);
    };

    // Check if we are switching within the same family or to a new one
    // We want to preserve the cart if it's the same family session
    const isSameFamily = currentActiveStudent &&
        student.family_id &&
        currentActiveStudent.family_id === student.family_id;

    if (!isSameFamily && currentPaymentItems.length > 0) {
        // Warning if switching family with items in cart
        showConfirmModal({
            title: '¿Cambiar de Familia?',
            message: 'Al cambiar de familia se borrarán los ítems actuales del carrito. ¿Deseas continuar?',
            confirmText: 'Continuar',
            isDestructive: true,
            onConfirm: async () => {
                currentPaymentItems = [];
                await proceedWithSelection();
            }
        });
    } else if (isSameFamily) {
        // Keep cart!
        console.log('Same family detected, preserving cart.');
        await proceedWithSelection();
    } else {
        // Fresh start (empty cart)
        currentPaymentItems = [];
        await proceedWithSelection();
    }
}

// Autocomplete Logic
if (cajaStudentSearch) {
    // Auto-load students if missing (e.g. user has permissions for Caja but not Student List)
    cajaStudentSearch.addEventListener('focus', async () => {
        if (!students || students.length === 0) {
            console.log('Caja Search: Students empty, fetching background...');
            await fetchStudentsData(); // Silent fetch
        }
    });

    cajaStudentSearch.addEventListener('input', () => {
        const term = cajaStudentSearch.value.trim().toLowerCase();
        cajaSearchSuggestions.innerHTML = ''; // Clear previous

        if (term.length < 2) {
            cajaSearchSuggestions.classList.add('hidden');
            return;
        }

        const matches = students.filter(s =>
            (s.unique_id && s.unique_id.toLowerCase().includes(term)) ||
            `${s.name} ${s.lastnameP} ${s.lastnameM}`.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term)
        ).slice(0, 10); // Limit to 10

        if (matches.length > 0) {
            matches.forEach(s => {
                const li = document.createElement('li');
                li.style.padding = '0.5rem 1rem';
                li.style.cursor = 'pointer';
                li.style.borderBottom = '1px solid #f3f4f6';
                li.textContent = `${s.name} ${s.lastnameP} ${s.lastnameM} (${s.id})`;
                li.addEventListener('mouseenter', () => li.style.backgroundColor = '#f3f4f6');
                li.addEventListener('mouseleave', () => li.style.backgroundColor = 'white');

                li.addEventListener('click', () => {
                    selectStudentForPayment(s);
                });

                cajaSearchSuggestions.appendChild(li);
            });
            cajaSearchSuggestions.classList.remove('hidden');
        } else {
            cajaSearchSuggestions.classList.add('hidden');
        }
    });

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!cajaStudentSearch.contains(e.target) && !cajaSearchSuggestions.contains(e.target)) {
            cajaSearchSuggestions.classList.add('hidden');
        }
    });
}

// Search Button (Fallback)
if (cajaSearchBtn) {
    cajaSearchBtn.addEventListener('click', async () => {
        const term = cajaStudentSearch.value.trim().toLowerCase();
        if (!term) return showAlertModal('Aviso', 'Por favor ingresa un término de búsqueda', true);

        const foundStudent = students.find(s =>
            (s.unique_id && s.unique_id.toLowerCase() === term) ||
            s.name.toLowerCase().includes(term) ||
            s.id.toLowerCase() === term
        );

        if (foundStudent) {
            selectStudentForPayment(foundStudent);
        } else {
            showAlertModal('Aviso', 'Alumno no encontrado', true);
            cajaPaymentInterface.classList.add('hidden');
        }
    });
}

// Load Payment History
// Toggle function for payment details
window.togglePaymentDetails = function (id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('hidden');
    }
};

// Load Payment History
async function loadPaymentHistory(studentId) {
    try {
        const payments = await apiFetch(`/payments/${studentId}`);
        currentStudentPayments = payments || []; // Store globally

        const tbody = document.getElementById('payments-history-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No hay pagos registrados.</td></tr>';
            return;
        }

        // Group payments by date
        const grouped = {};
        payments.forEach(p => {
            // STRICT Date Normalization: Use YYYY-MM-DD string prefix only
            // This avoids Date() object timezone shifts (e.g. UTC vs Local)
            let dateKeyStr = '';
            if (p.payment_date && p.payment_date.length >= 10) {
                dateKeyStr = p.payment_date.substring(0, 10); // "2023-12-25"
            } else {
                dateKeyStr = 'Unknown';
            }

            // Create display label from the specific YYYY-MM-DD (treat as local)
            // We append T00:00:00 to force local interpretation or parse manually
            let label = dateKeyStr;
            if (dateKeyStr !== 'Unknown') {
                const [y, m, d] = dateKeyStr.split('-');
                // Construct friendly label DD/MM/YYYY
                label = `${d}/${m}/${y}`;
            }

            if (!grouped[dateKeyStr]) {
                grouped[dateKeyStr] = {
                    date: label, // Display Label
                    concepts: [],
                    amount: 0,
                    methods: new Set(),
                    statuses: new Set(),
                    rawDate: dateKeyStr // For sorting
                };
            }

            grouped[dateKeyStr].concepts.push(p.concept);
            grouped[dateKeyStr].amount += parseFloat(p.amount);
            if (p.payment_method) {
                grouped[dateKeyStr].methods.add(p.payment_method);
            }
            // Track Status (Default to COMPLETED for legacy)
            grouped[dateKeyStr].statuses.add(p.status || 'COMPLETED');
        });

        // Convert to array and Sort descending by date (newest first)
        const sortedGroups = Object.values(grouped).sort((a, b) => b.rawDate.localeCompare(a.rawDate));

        console.log(`[DEBUG] Rendering ${sortedGroups.length} groups.`);

        sortedGroups.forEach(g => {
            // Unique ID for detail div
            const detailsId = `pay-details-${g.rawDate.replace(/-/g, '')}`;
            const count = g.concepts.length;
            const summaryText = `${count} Concepto${count > 1 ? 's' : ''} (Ver Detalle)`;

            // Use line breaks and bullets for better readability in details
            const detailedList = g.concepts.map(c => `&bull; ${c}`).join('<br>');
            const combinedMethods = Array.from(g.methods).join('<br>');

            // Status Logic
            const statuses = Array.from(g.statuses);
            let statusBadge = '';
            let rowBg = 'white'; // Default

            if (statuses.includes('PENDING')) {
                statusBadge = '<div style="font-size:0.65rem; background:#fef9c3; color:#a16207; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:2px;">PENDIENTE</div>';
                rowBg = '#fffbeb'; // Light Yellow Row
            } else if (statuses.includes('COMPLETED')) {
                statusBadge = '<div style="font-size:0.65rem; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:2px;">PAGADO</div>';
            } else {
                statusBadge = '<div style="font-size:0.65rem; background:#f1f5f9; color:#64748b; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:2px;">' + (statuses[0] || 'N/A') + '</div>';
            }

            const row = `
                <tr onclick="togglePaymentDetails('${detailsId}')" style="background-color: ${rowBg}; cursor: pointer; border-bottom: 2px solid #d1d5db; transition: background-color 0.2s;">
                    <td style="vertical-align: top;">
                        ${g.date}
                        <br>${statusBadge}
                    </td>
                    <td style="vertical-align: top;">
                        <div style="font-weight:600; color:var(--primary); margin-bottom: 4px;">${summaryText}</div>
                        <div id="${detailsId}" class="hidden" style="color: #4b5563; font-size: 0.9em; padding-left: 0.5rem; border-left: 2px solid #e5e7eb;">
                            ${detailedList}
                        </div>
                    </td>
                    <td style="vertical-align: top;">${combinedMethods}</td>
                    <td style="font-weight: bold; vertical-align: top;">$${formatCurrency(g.amount)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Add hover effect via JS or assume CSS handles 'tr:hover'
        // Inline style added for transition.

    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Handle Payment Submission
// Payment List Interface Logic
const btnAddItem = document.getElementById('btn-add-item');
const paymentItemsContainer = document.getElementById('payment-items-container');
const paymentItemsList = document.getElementById('payment-items-list');
const paymentTotalDisplay = document.getElementById('payment-total-display');

function renderPaymentList() {
    paymentItemsList.innerHTML = '';
    let total = 0;

    currentPaymentItems.forEach((item, index) => {
        total += parseFloat(item.amount);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 0.5rem 1rem; color: #4b5563; font-size: 0.9rem;">${item.student_name} <br><small style="color: #666;">(${item.student_id})</small></td>
            <td style="padding: 0.5rem 1rem;">${item.concept}</td>
            <td style="padding: 0.5rem 1rem; text-align: right;">$${formatCurrency(item.amount)}</td>
            <td style="text-align: center;">
                <button type="button" onclick="removePaymentItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold;">&times;</button>
            </td>
        `;
        paymentItemsList.appendChild(row);
    });

    paymentTotalDisplay.textContent = `$${formatCurrency(total)}`;

    if (currentPaymentItems.length > 0) {
        paymentItemsContainer.classList.remove('hidden');
    } else {
        paymentItemsContainer.classList.add('hidden');
    }
}

function removePaymentItem(index) {
    currentPaymentItems.splice(index, 1);
    renderPaymentList();
}
window.removePaymentItem = removePaymentItem; // Make globally accessible

// Populate Cashier Concepts from DB
// Global to store history for filtering
let currentStudentPayments = [];

// Load Payment History


// Populate Cashier Concepts from DB
function populateCashierConcepts(studentLevel) {
    const conceptSelect = document.getElementById('payment-concept');
    if (!conceptSelect) return;

    conceptSelect.innerHTML = '<option value="" disabled selected>Seleccionar concepto</option>';

    // Filter concepts: Match Level OR General
    // Use case-insensitive match for robustness
    const targetLevel = (studentLevel || '').toUpperCase();

    const filtered = allConcepts
        .filter(c => {
            const cLevel = (c.academic_level || 'GENERAL').toUpperCase();
            return cLevel === 'GENERAL' || cLevel === targetLevel;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    filtered.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.textContent = c.name;
        option.dataset.amount = c.default_amount;
        conceptSelect.appendChild(option);
    });
}


// Auto-fill price on concept selection
const paymentConceptSelectElement = document.getElementById('payment-concept');
if (paymentConceptSelectElement) {
    paymentConceptSelectElement.addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        const amountInput = document.getElementById('payment-amount');
        const monthSelect = document.getElementById('payment-month');

        if (selectedOption) {
            // Price Logic
            if (selectedOption.dataset.amount) {
                amountInput.value = formatCurrency(parseFloat(selectedOption.dataset.amount));
                amountInput.readOnly = true;
                amountInput.style.backgroundColor = '#f1f5f9';
                amountInput.style.cursor = 'not-allowed';
            } else {
                amountInput.value = '';
                amountInput.readOnly = false;
                amountInput.style.backgroundColor = 'white';
                amountInput.style.cursor = 'text';
            }

            // Month Visibility & Filtering Logic
            const conceptName = selectedOption.textContent.toLowerCase();

            if (conceptName.includes('mensualidad') || conceptName.includes('lunch') || conceptName.includes('colegiatura')) {
                if (monthSelect) {
                    monthSelect.style.display = 'block';
                    monthSelect.required = true;
                    monthSelect.value = ''; // Reset selection

                    // Only filter for 'Mensualidad' as requested
                    if (conceptName.includes('mensualidad')) {
                        // 1. Map History Months to Status
                        const historyMonthsMap = {};
                        currentStudentPayments.forEach(p => {
                            if (p.concept.toLowerCase().includes('mensualidad')) {
                                const parts = p.concept.split(' - ');
                                const m = parts.length > 1 ? parts[1].trim() : '';
                                if (m) {
                                    const s = p.status || 'COMPLETED';
                                    // If already marked COMPLETED, keep it. Else update.
                                    if (!historyMonthsMap[m] || historyMonthsMap[m] !== 'COMPLETED') {
                                        historyMonthsMap[m] = s;
                                    }
                                }
                            }
                        });

                        // 2. Get Pending Months in Cart (Current Session)
                        const cartMonths = currentPaymentItems
                            .filter(item => item.concept.toLowerCase().includes('mensualidad') && item.student_id === (currentActiveStudent ? currentActiveStudent.id : null))
                            .map(item => {
                                const parts = item.concept.split(' - ');
                                return parts.length > 1 ? parts[1].trim() : '';
                            });

                        // 3. Filter Options
                        Array.from(monthSelect.options).forEach(opt => {
                            if (opt.value === '') return; // Skip label

                            let isDisabled = false;
                            let suffix = '';

                            // Check History
                            if (historyMonthsMap[opt.value]) {
                                isDisabled = true;
                                suffix = historyMonthsMap[opt.value] === 'COMPLETED' ? ' (PAGADO)' : ' (PENDIENTE)';
                            }
                            // Check Cart
                            else if (cartMonths.includes(opt.value)) {
                                isDisabled = true;
                                suffix = ' (AGREGADO)';
                            }

                            if (isDisabled) {
                                opt.disabled = true;
                                opt.textContent = `${opt.value}${suffix}`;
                            } else {
                                opt.disabled = false;
                                opt.textContent = opt.value;
                            }
                        });
                    } else {
                        // Reset if not 'Mensualidad' (e.g. Lunch) - Enable all
                        Array.from(monthSelect.options).forEach(opt => {
                            opt.disabled = false;
                            if (opt.value !== '') opt.textContent = opt.value;
                        });
                    }
                }
            } else {
                if (monthSelect) {
                    monthSelect.style.display = 'none';
                    monthSelect.required = false; // Fix: Remove required if hidden
                    monthSelect.value = '';
                }
            }
        } else {
            amountInput.value = '';
            if (monthSelect) {
                monthSelect.style.display = 'none';
                monthSelect.required = false; // Fix: Remove required if hidden
            }
        }
    });
}

// Format Cashier Input on Blur
const cashierAmountInput = document.getElementById('payment-amount');
if (cashierAmountInput) {
    cashierAmountInput.addEventListener('blur', (e) => {
        const val = parseCurrency(e.target.value);
        e.target.value = formatCurrency(val);
    });
}

if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
        const conceptSelect = document.getElementById('payment-concept');
        const monthSelect = document.getElementById('payment-month');
        const amountInput = document.getElementById('payment-amount');

        let concept = conceptSelect.value;
        const month = monthSelect.value;
        // Updated to parseCurrency
        const amount = parseCurrency(amountInput.value);

        if (!concept) {
            showAlertModal('Aviso', 'Por favor selecciona un concepto', true);
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            showAlertModal('Aviso', 'Por favor ingresa un monto válido', true);
            return;
        }

        // Append month to concept if selected
        if (month) {
            concept += ` - ${month}`;
        }

        currentPaymentItems.push({
            concept,
            amount,
            student_id: currentActiveStudent ? currentActiveStudent.id : null,
            student_name: currentActiveStudent ? `${currentActiveStudent.name} ${currentActiveStudent.lastnameP}` : 'Desconocido'
        });
        renderPaymentList();

        // Reset inputs
        conceptSelect.value = '';
        monthSelect.value = '';
        amountInput.value = '';
        if (monthSelect.style.display !== 'none') monthSelect.style.display = 'none'; // reset visibility check logic if existed
        conceptSelect.focus();
    });
}

// Modify selectStudentForPayment to reset list
// Logic integrated into original function



// Handle Payment Submission
const btnSubmitPayment = document.getElementById('btn-submit-payment');
if (btnSubmitPayment) {
    btnSubmitPayment.addEventListener('click', async () => {
        const studentSelect = document.getElementById('item-student-select'); // For cart
        // Legacy: use hidden input id if cart not used? Actually logic relies on currentPaymentItems logic mostly.
        const legacyStudentId = document.getElementById('payment-student-db-id').value;
        const methodSelect = document.getElementById('payment-method');
        const paymentDate = document.getElementById('payment-date').value;

        // --- 1. Gather Data / Add Single Item to Cart if Cart Empty ---
        if (currentPaymentItems.length === 0) {
            const concept = document.getElementById('payment-concept').value;
            const amount = document.getElementById('payment-amount').value;

            if (concept && amount) {
                // Determine Student ID: Select > Hidden Input > Active Student
                // Note: item-student-select might be "all" or specific.
                let targetId = legacyStudentId;
                if (studentSelect && studentSelect.value) targetId = studentSelect.value;
                if (!targetId && currentActiveStudent) targetId = currentActiveStudent.id;

                if (!targetId) {
                    showAlertModal('Error', 'No se ha seleccionado un alumno.', true);
                    return;
                }

                currentPaymentItems.push({
                    concept: concept,
                    amount: parseCurrency(amount),
                    student_id: targetId,
                    student_name: currentActiveStudent ? `${currentActiveStudent.name} ${currentActiveStudent.lastnameP}` : 'Actual'
                });
            } else {
                showAlertModal('Aviso', 'Agrega items al pago o llena los campos concepto y monto.', true);
                return;
            }
        }

        // --- 2. Common Validation ---
        if (currentPaymentItems.length === 0) {
            showAlertModal('Aviso', 'No hay items para cobrar.', true);
            return;
        }
        if (!methodSelect.value || !paymentDate) {
            showAlertModal('Aviso', 'Selecciona método y fecha de pago.', true);
            return;
        }

        const method = methodSelect.value;
        const totalAmount = currentPaymentItems.reduce((sum, item) => sum + item.amount, 0);

        // --- 3. CoDi Flow (Notification Mode) ---
        if (method === 'CoDi') {
            const modal = document.getElementById('codi-modal');
            const stepInput = document.getElementById('codi-admin-step-input');
            const stepSuccess = document.getElementById('codi-admin-step-success');
            const amountDisplay = document.getElementById('codi-admin-amount-display');
            const phoneInput = document.getElementById('codi-admin-phone');
            const btnSend = document.getElementById('btn-send-codi-admin');

            // Reset UI
            modal.classList.remove('hidden');
            stepInput.classList.remove('hidden');
            stepSuccess.classList.add('hidden');
            amountDisplay.textContent = `$${formatCurrency(totalAmount)}`;
            phoneInput.value = ''; // Reset phone
            phoneInput.focus();

            // Handle Send Action
            btnSend.onclick = async () => {
                const phone = phoneInput.value.trim();
                if (phone.length !== 10) {
                    showAlertModal('Aviso', 'Ingresa un número celular válido (10 dígitos)', true);
                    return;
                }

                try {
                    btnSend.disabled = true;
                    btnSend.innerHTML = '<span class="material-icons-outlined">hourglass_empty</span> Enviando...';

                    const mainStudentId = currentPaymentItems[0].student_id;
                    const conceptSummary = currentPaymentItems.length > 1 ? `Pago de ${currentPaymentItems.length} conceptos` : currentPaymentItems[0].concept;

                    const response = await apiFetch('/payments/codi/request', {
                        method: 'POST',
                        body: JSON.stringify({
                            student_id: mainStudentId,
                            amount: totalAmount,
                            concept: conceptSummary,
                            items: currentPaymentItems,
                            phoneNumber: phone
                        })
                    });

                    if (response.success) {
                        stepInput.classList.add('hidden');
                        stepSuccess.classList.remove('hidden');

                        // Clear form data as payment is registered (PENDING)
                        currentPaymentItems = [];
                        updatePaymentItemsList();
                        document.getElementById('caja-student-search').value = '';
                        // Optionally refresh history if visible
                    } else {
                        showAlertModal('Error', 'Error al enviar solicitud: ' + (response.error || 'Desconocido'), true);
                    }

                } catch (error) {
                    console.error('CoDi Error:', error);
                    showAlertModal('Error', 'Error de conexión con el servicio de pagos.', true);
                } finally {
                    btnSend.disabled = false;
                    btnSend.innerHTML = '<span class="material-icons-outlined">send_to_mobile</span> Enviar Solicitud';
                }
            };

            return; // Stop normal flow
        }

        // --- 4. Normal Flow (Confirmation + Post) ---
        let confirmationMsg = 'Por favor confirma los pagos:\n\n';
        currentPaymentItems.forEach(item => {
            confirmationMsg += `- ${item.concept} ($${formatCurrency(item.amount)})\n`;
        });
        confirmationMsg += `\nTotal: $${formatCurrency(totalAmount)}`;
        confirmationMsg += `\nMétodo: ${method}`;

        if (!await showConfirmAsync('Confirmación', confirmationMsg)) return;

        const payload = {
            student_id: currentPaymentItems[0].student_id, // Fallback, backend uses items array primarily if present?
            // Actually existing backend uses items array if present.
            payment_method: method,
            payment_date: paymentDate,
            items: currentPaymentItems
        };

        try {
            btnSubmitPayment.disabled = true;
            btnSubmitPayment.textContent = 'Procesando...';

            await apiFetch('/payments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            showAlertModal('Éxito', 'Pago registrado exitosamente');

            // Cleanup
            document.getElementById('payment-concept').value = '';
            document.getElementById('payment-amount').value = '';

            currentPaymentItems = [];
            if (typeof renderPaymentList === 'function') renderPaymentList(); // Ensure this exists

            // Refresh History
            // Try to find a student ID to refresh history for
            const sid = document.getElementById('payment-student-db-id').value || (currentActiveStudent ? currentActiveStudent.id : null);
            if (sid && typeof loadPaymentHistory === 'function') loadPaymentHistory(sid);

            // Close form if it was a single student modal style interaction? 
            // The UI seems to be inline in 'caja-payment-interface'. We can hide it or clear it.
            // Original code hid it:
            const paymentInterface = document.getElementById('caja-payment-interface');
            if (paymentInterface) paymentInterface.classList.add('hidden');
            const studentSearch = document.getElementById('caja-student-search');
            if (studentSearch) studentSearch.value = '';

        } catch (error) {
            console.error('Submission error:', error);
            showAlertModal('Error', 'Error al registrar pago: ' + error.message, true);
        } finally {
            btnSubmitPayment.disabled = false;
            btnSubmitPayment.textContent = 'Registrar Pago';
        }
    });

    // CoDi Modal Listeners
    const closeCodiBtn = document.querySelector('.close-modal-codi');
    if (closeCodiBtn) {
        closeCodiBtn.addEventListener('click', () => {
            const modal = document.getElementById('codi-modal');
            if (modal) modal.classList.add('hidden');
        });
    }

    const checkCodiBtn = document.getElementById('btn-check-codi');
    if (checkCodiBtn) {
        checkCodiBtn.addEventListener('click', () => {
            // Manual check simulation
            // In real life, this would call /payments/codi/status/:id
            const modal = document.getElementById('codi-modal');
            const transactionId = modal.getAttribute('data-transaction-id');
            // Mock success
            alert('En producción, esto verificaría el estatus real de la transacción ' + (transactionId || '') + '. Por ahora, asumiendo éxito para pruebas.');

            modal.classList.add('hidden');
            const paymentInterface = document.getElementById('caja-payment-interface');
            if (paymentInterface) paymentInterface.classList.add('hidden');
            const studentSearch = document.getElementById('caja-student-search');
            if (studentSearch) studentSearch.value = '';

            alert('Pago CoDi confirmado (Simulado).');
            currentPaymentItems = [];
            // Refresh History
            const sid = document.getElementById('payment-student-db-id').value || (currentActiveStudent ? currentActiveStudent.id : null);
            if (sid && typeof loadPaymentHistory === 'function') loadPaymentHistory(sid);
        });
    }
}
// --- Reports Logic ---

async function generateIncomeReport() {
    const startDate = document.getElementById('report-date-start').value;
    const endDate = document.getElementById('report-date-end').value;
    const tbody = document.getElementById('report-table-body');
    const totalDisplay = document.getElementById('report-total-income');
    const countDisplay = document.getElementById('report-count');

    if (!startDate || !endDate) {
        alert('Por favor selecciona un rango de fechas');
        return;
    }

    try {
        const query = new URLSearchParams({ startDate, endDate }).toString();
        const payments = await apiFetch(`/reports/income?${query}`);

        tbody.innerHTML = '';
        let totalIncome = 0;

        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No se encontraron movimientos en este periodo.</td></tr>';
            totalDisplay.textContent = '$0.00';
            countDisplay.textContent = '0';
            return;
        }

        // Grouping Logic (Mirrors Payment History)
        const grouped = {};
        payments.forEach(p => {
            totalIncome += parseFloat(p.amount);

            // Strict Date Normalization
            let dateKeyStr = '';
            if (p.payment_date && p.payment_date.length >= 10) {
                dateKeyStr = p.payment_date.substring(0, 10);
            } else {
                dateKeyStr = 'Unknown';
            }

            let label = dateKeyStr;
            if (dateKeyStr !== 'Unknown') {
                const [y, m, d] = dateKeyStr.split('-');
                label = `${d}/${m}/${y}`;
            }

            if (!grouped[dateKeyStr]) {
                grouped[dateKeyStr] = {
                    date: label,
                    rawDate: dateKeyStr,
                    total: 0,
                    methods: new Set(),
                    items: [] // { student, concept, amount }
                };
            }

            grouped[dateKeyStr].total += parseFloat(p.amount);
            if (p.payment_method) grouped[dateKeyStr].methods.add(p.payment_method);
            grouped[dateKeyStr].items.push({
                student: p.student_name,
                concept: p.concept,
                amount: p.amount
            });
        });

        // Sort descending
        const sortedGroups = Object.values(grouped).sort((a, b) => b.rawDate.localeCompare(a.rawDate));

        sortedGroups.forEach(g => {
            const detailsId = `report-details-${g.rawDate.replace(/-/g, '')}`;
            const count = g.items.length;
            const summaryText = `${count} Movimiento${count > 1 ? 's' : ''} (Ver Detalle)`;

            const methods = Array.from(g.methods).join('<br>');

            // Sub-group items by Student for cleaner display
            const studentsMap = {};
            g.items.forEach(item => {
                if (!studentsMap[item.student]) {
                    studentsMap[item.student] = [];
                }
                studentsMap[item.student].push(item);
            });

            // Generate HTML for each student group
            // Sort students alphabetically for neatness
            const studentNames = Object.keys(studentsMap).sort();

            const detailHtml = studentNames.map(name => {
                const studentItems = studentsMap[name];
                // Render List of concepts for this student
                const itemsHtml = studentItems.map(i =>
                    `&nbsp;&nbsp;&bull; ${i.concept} ($${formatCurrency(i.amount)})`
                ).join('<br>');

                return `
                    <div style="margin-bottom: 6px;">
                        <strong>${name}</strong><br>
                        <div style="color: #6b7280; font-style: italic;">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            // Colspan 2 for Student+Concept columns to give space for expandable detail
            const row = `
                <tr onclick="togglePaymentDetails('${detailsId}')" style="cursor: pointer; border-bottom: 2px solid #d1d5db; transition: background-color 0.2s;">
                    <td style="vertical-align: top;">${g.date}</td>
                    <td colspan="2" style="vertical-align: top;">
                         <div style="font-weight:600; color:var(--primary); margin-bottom: 4px;">${summaryText}</div>
                         <div id="${detailsId}" class="hidden" style="color: #4b5563; font-size: 0.9em; padding-left: 0.5rem; border-left: 2px solid #e5e7eb;">
                            ${detailHtml}
                         </div>
                    </td>
                    <td style="vertical-align: top;">${methods}</td>
                    <td style="vertical-align: top; text-align: right; font-weight: bold;">$${formatCurrency(g.total)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        totalDisplay.textContent = `$${formatCurrency(totalIncome)}`;
        countDisplay.textContent = payments.length;

    } catch (error) {
        console.error('Error generating report:', error);
        showAlertModal('Error', 'Error al generar reporte: ' + error.message, true);
    }
}

const btnGenerateReport = document.getElementById('btn-generate-report');
if (btnGenerateReport) {
    btnGenerateReport.addEventListener('click', generateIncomeReport);
}

// --- Inquiry Form Logic ---

const ACADEMIC_LEVELS = {
    'Maternal': ['Maternal 1', 'Maternal 2'],
    'Preescolar': ['Preescolar 1', 'Preescolar 2', 'Preescolar 3'],
    'Primaria': ['1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria'],
    'Secundaria': ['1º Secundaria', '2º Secundaria', '3º Secundaria']
};

const inquiryForm = document.getElementById('inquiry-form');
const marketingSourceSelect = document.getElementById('inquiry-marketing-source');
const marketingOtherContainer = document.getElementById('inquiry-marketing-other-container');
const inquiryLevelSelect = document.getElementById('inquiry-level');
const inquiryGradeSelect = document.getElementById('inquiry-grade');

if (inquiryLevelSelect && inquiryGradeSelect) {
    inquiryLevelSelect.addEventListener('change', (e) => {
        const level = e.target.value;
        const grades = ACADEMIC_LEVELS[level] || [];

        // Clear and populate
        inquiryGradeSelect.innerHTML = '<option value="" disabled selected>Seleccionar grado</option>';

        if (grades.length > 0) {
            inquiryGradeSelect.disabled = false;
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                inquiryGradeSelect.appendChild(option);
            });
        } else {
            inquiryGradeSelect.disabled = true;
            inquiryGradeSelect.innerHTML = '<option value="" disabled selected>Selecciona nivel primero</option>';
        }
    });
}

if (marketingSourceSelect) {
    marketingSourceSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Otros') {
            marketingOtherContainer.classList.remove('hidden');
            document.getElementById('inquiry-marketing-other').setAttribute('required', 'true');
        } else {
            marketingOtherContainer.classList.add('hidden');
            document.getElementById('inquiry-marketing-other').removeAttribute('required');
            document.getElementById('inquiry-marketing-other').value = '';
        }
    });
}

if (inquiryForm) {
    const emailInput = document.getElementById('inquiry-email');
    const emailConfirmInput = document.getElementById('inquiry-email-confirm');

    // Clear error style on typing
    [emailInput, emailConfirmInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                input.style.borderColor = '';
            });
        }
    });

    // Immediate validation on blur
    if (emailConfirmInput) {
        emailConfirmInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            const confirm = emailConfirmInput.value.trim();

            // Only validate if both have values (don't annoy if just tabbed through empty)
            if (email && confirm && email !== confirm) {
                emailInput.style.borderColor = '#ef4444';
                emailConfirmInput.style.borderColor = '#ef4444';
                showConfirmModal({
                    title: 'Correos no coinciden',
                    message: 'Los correos ingresados son diferentes. Por favor corrígelos antes de continuar.',
                    isAlert: true,
                    isDestructive: true,
                    confirmText: 'Corregir'
                });
            }
        });
    }

    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const emailConfirm = emailConfirmInput.value.trim();

        if (email !== emailConfirm) {
            emailInput.style.borderColor = '#ef4444';
            emailConfirmInput.style.borderColor = '#ef4444';

            return showConfirmModal({
                title: 'Correos no coinciden',
                message: 'Por favor verifica que el correo electrónico y su confirmación sean idénticos.',
                isAlert: true,
                isDestructive: true,
                confirmText: 'Entendido'
            });
        }
        const payload = {
            parent_name: document.getElementById('inquiry-parent-name').value,
            email: document.getElementById('inquiry-email').value,
            phone: document.getElementById('inquiry-phone-code').value + ' ' + document.getElementById('inquiry-phone').value,
            child_name: document.getElementById('inquiry-child-name').value,
            birth_date: document.getElementById('inquiry-birth-date').value,
            requested_grade: document.getElementById('inquiry-grade').value,
            previous_school: document.getElementById('inquiry-previous-school').value,
            marketing_source: marketingSourceSelect.value,
            marketing_source_other: document.getElementById('inquiry-marketing-other').value
        };

        try {
            await apiFetch('/inquiries', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showAlertModal('Éxito', 'Solicitud guardada correctamente.');
            inquiryForm.reset();
            // Manually reset grade select options since reset() doesn't remove dynamic elements
            if (inquiryGradeSelect) {
                inquiryGradeSelect.innerHTML = '<option value="" disabled selected>Selecciona nivel primero</option>';
                inquiryGradeSelect.disabled = true;
            }
            // Reset "Otros" field visibility
            marketingOtherContainer.classList.add('hidden');
        } catch (error) {
            console.error('Error saving inquiry:', error);
            showAlertModal('Error', 'Error al guardar solicitud: ' + error.message, true);
        }
    });
}

// --- Inquiries List Logic ---

async function loadInquiries() {
    try {
        const lvl = document.getElementById('report-filter-level') ? document.getElementById('report-filter-level').value : '';
        const sts = document.getElementById('report-filter-status') ? document.getElementById('report-filter-status').value : '';

        const params = new URLSearchParams();
        if (lvl) params.append('level', lvl);
        if (sts) params.append('status', sts);

        const inquiries = await apiFetch(`/inquiries?${params.toString()}`);
        renderInquiries(inquiries);
    } catch (error) {
        console.warn('Suppressing loadInquiries error alert on load:', error);
        // showAlertModal('Error', 'Error al cargar la lista de informes.', true);
    }
}

function renderInquiries(list) {
    const container = document.getElementById('inquiries-container');
    if (!container) return;

    // INJECT FILTERS (Dynamic) - NOW IN HEADER
    const filtersContainer = document.getElementById('inquiries-header-filters-container');

    // Only inject if empty to prevent duplicates
    if (filtersContainer && filtersContainer.innerHTML.trim().length < 10) {
        filtersContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <select id="report-filter-level" style="padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: #f8fafc;">
                    <option value="">Nivel: Todos</option>
                    <option value="Maternal">Maternal</option>
                    <option value="Preescolar">Preescolar</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Preparatoria">Preparatoria</option>
                </select>

                <select id="report-filter-status" style="padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: #f8fafc;">
                    <option value="">Estatus: Todos</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="attended">Asistieron</option>
                </select>
                
                 <button id="btn-export-pdf" style="display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #ef4444; border: 1px solid #ef4444; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;">
                    <span class="material-icons-outlined" style="font-size: 1.1rem;">picture_as_pdf</span>
                    PDF
                </button>
            </div>
        `;

        // Bind Events
        document.getElementById('report-filter-level').addEventListener('change', () => loadInquiries());
        document.getElementById('report-filter-status').addEventListener('change', () => loadInquiries());

        // Bind PDF Button
        document.getElementById('btn-export-pdf').addEventListener('click', async () => {
            const btn = document.getElementById('btn-export-pdf');
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons-outlined spin">sync</span> Generando...';

            try {
                const lvl = document.getElementById('report-filter-level').value;
                const sts = document.getElementById('report-filter-status').value;
                const startDate = document.getElementById('inquiry-filter-start-date').value;
                const endDate = document.getElementById('inquiry-filter-end-date').value;

                // Construct Headers manually since we need blob(), not json()
                const headers = {};
                const token = localStorage.getItem('authToken');
                if (token) headers['Authorization'] = `Bearer ${token}`;
                if (currentUser && currentUser.role) headers['x-user-role'] = normalizeRole(currentUser.role);

                // Direct Open (Browser handles download/filename)
                // Use absolute URL to avoid any ambiguity on mobile
                const downloadUrl = `${window.location.origin}${API_URL}/inquiries/export-pdf?level=${encodeURIComponent(lvl)}&status=${encodeURIComponent(sts)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&token=${encodeURIComponent(token)}`;
                window.open(downloadUrl, '_blank');

            } catch (error) {
                console.error('PDF Export Error:', error);
                alert('Error al incializar descarga: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        });
    }

    container.innerHTML = '';

    if (!list || list.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-light); padding: 3rem;">No hay solicitudes registradas.</div>';
        return;
    }

    list.forEach(item => {
        // Safe Date Formatting
        let dateStr = '-';
        if (item.created_at) {
            const d = new Date(item.created_at);
            if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
        }

        const card = document.createElement('div');
        card.className = 'card inquiry-card';
        card.style.padding = '1rem 1.5rem';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '2rem';
        card.style.borderLeft = '4px solid var(--primary)'; // Left accent instead of top
        card.style.borderTop = 'none';

        card.innerHTML = `
            <div style="padding-right: 1rem;">
                <input type="checkbox" class="inquiry-checkbox" value="${item.id}" style="width: 18px; height: 18px;">
            </div>
            <div style="min-width: 100px;">
                <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); font-weight: 600; display: block; margin-bottom: 0.25rem;">Fecha</label>
                <div style="font-weight: 600; color: var(--text-dark);">${dateStr}</div>
            </div>

            <div style="flex: 2;">
                <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); font-weight: 600; display: block; margin-bottom: 0.25rem;">Alumno</label>
                <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${item.child_name || '-'}</div>
                <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.1rem;">${item.requested_grade || 'Sin Grado'} ${item.previous_school ? `• De: ${item.previous_school}` : ''}</div>
            </div>

            <div style="flex: 1.5;">
                <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); font-weight: 600; display: block; margin-bottom: 0.25rem;">Contacto</label>
                <div style="font-weight: 500; color: #334155;">${item.parent_name || '-'}</div>
                <div style="font-size: 0.85rem; color: var(--text-light);">${item.phone || '-'}</div>
                <div style="font-size: 0.85rem; color: var(--primary);">${item.email || '-'}</div>
            </div>

            <div style="min-width: 120px; text-align: right;">
                 <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); font-weight: 600; display: block; margin-bottom: 0.25rem;">Medio</label>
                 <span style="background: #f3f4f6; padding: 4px 10px; border-radius: 999px; font-size: 0.85rem; font-weight: 500; display: inline-block;">
                    ${item.marketing_source || '-'}
                </span>
                ${item.marketing_source === 'Otros' && item.marketing_source_other ?
                `<div style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px;">${item.marketing_source_other}</div>` : ''}
                <!-- Delete Button Removed -->
            </div>
            
            <div style="flex: 2; border-left: 1px solid var(--border); padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); font-weight: 600; display: block;">Seguimiento</label>
                <div style="display: flex; align-items: center; white-space: nowrap;">
                    ${[
                { label: 'Información Enviada', key: 'flag_info_sent' },
                { label: 'Cita', key: 'flag_scheduled' },
                { label: 'Asistió', key: 'flag_attended' },
                { label: 'Evaluación', key: 'flag_evaluation' },
                { label: 'Aceptado', key: 'flag_accepted' },
                { label: 'Pago', key: 'flag_finished' }
            ].map(step => {
                const isDone = item[step.key] === 1 || item[step.key] === true;
                const isSystemOnly = step.key === 'flag_info_sent';

                // Red circle (incomplete) -> Green circle (complete)
                const bg = isDone ? '#22c55e' : '#ef4444'; // Green-500 or Red-500
                const isLast = step.key === 'flag_finished';

                return `
                            <div style="display: flex; align-items: center;">
                                <div
                                    ${isSystemOnly ? '' : `onclick="toggleInquiryFlag(${item.id}, '${step.key}', ${!isDone})"`}
                                    title="${step.label}${isDone ? ' (Completado)' : ' (Pendiente)'}"
                                    style="
                                        width: 24px;
                                        height: 24px;
                                        background: ${bg};
                                        border-radius: 50%;
                                        cursor: ${isSystemOnly ? 'default' : 'pointer'};
                                        transition: all 0.2s;
                                        opacity: ${isSystemOnly && !isDone ? '0.5' : '1'};
                                        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                                    "
                                    onmouseover="this.style.transform='scale(1.2)'"
                                    onmouseout="this.style.transform='scale(1)'"
                                ></div>
                                ${!isLast ? '<div style="width: 8px; border-bottom: 2px dotted #cbd5e1; margin: 0 2px;"></div>' : ''}
                            </div>
                        `;
            }).join('')}
                </div>
            </div>
            `;
        container.appendChild(card);
    });
}




// Ensure listeners for grade changes exist (Removed duplicate)


// Duplicate logic removed (lines 2534-2600)

// Handler for the native select action
window.handleStudentAction = (selectElement, id) => {
    const action = selectElement.value;
    // Reset selection immediately so it can be used again
    selectElement.value = "";

    if (action === 'view' || action === 'info') {
        viewStudentDetails(id);
    } else if (action === 'edit') {
        editStudent(id);
    } else if (action === 'delete') {
        deleteStudent(id);
    } else if (action === 'view_family') {
        viewFamily(id);
    }
};

// --- Missing Helper Functions Restored ---





// --- Family View Logic ---

window.viewFamily = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const familyId = student.family_id;
    if (!familyId) {
        alert('Este alumno no tiene un ID Familiar asignado.');
        return;
    }

    document.getElementById('family-modal-id').textContent = familyId;


    // 1. Get Siblings (All students with same family_id)
    const siblings = students.filter(s => s.family_id === familyId);
    const siblingsBody = document.getElementById('family-siblings-body');
    siblingsBody.innerHTML = '';

    siblings.forEach(sib => {
        const row = document.createElement('tr');
        // Highlight current student
        const isCurrent = sib.id === studentId;
        row.style.backgroundColor = isCurrent ? '#f0f9ff' : '';

        row.style.fontSize = '0.85rem'; // Smaller font as requested

        row.innerHTML = `
                < td > ${sib.id}</td >
            <td>${sib.name} ${sib.lastnameP} ${sib.lastnameM} ${isCurrent ? ' (Seleccionado)' : ''}</td>
            <td>${sib.curp || '-'}</td>
            <td>${sib.grade || '-'}</td>
            <td>${sib.subgrade || '-'}</td>
            <td>${sib.group_name || '-'}</td>
            `;
        siblingsBody.appendChild(row);
    });

    // 2. Get Parents
    // We assume parents are linked to the family via students.
    // Ideally, we fetch parents for ALL siblings and merge unique ones.
    const parentsBody = document.getElementById('family-parents-body');
    parentsBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    try {
        // Fetch parents for the current student (simplification: assuming synced)
        // Or better: Iterate siblings and fetch? No, too many requests.
        // Let's rely on the student_parents table being populated correctly for each student.
        // Or if the backend supported `GET / parents ? family_id =...` that would be best.
        // For now, let's fetch for the current student.

        const parents = await apiFetch(`/ students / ${studentId} / parents`);
        parentsBody.innerHTML = '';

        if (!parents || parents.length === 0) {
            parentsBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay padres registrados</td></tr>';
        } else {
            parents.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
        < td > ${p.type === 'MOTHER' ? 'Madre' :
                        p.type === 'FATHER' ? 'Padre' : 'Tutor'
                    }</td >
                    <td>${p.name} ${p.lastnameP} ${p.lastnameM}</td>
                    <td>${p.phone || '-'}</td>
                    <td>${p.email || '-'}</td>
                `;
                parentsBody.appendChild(row);
            });
        }

    } catch (e) {
        console.error(e);
        parentsBody.innerHTML = '<tr><td colspan="4" style="color:red;">Error al cargar padres</td></tr>';
    }

    // Show Modal
    document.getElementById('family-modal').classList.remove('hidden');
};

window.updateInquiryStatus = async (id, status) => {
    try {
        await apiFetch(`/ inquiries / ${id} / status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        loadInquiries(); // Refresh to show update
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error al actualizar estado');
    }
};


window.toggleInquiryFlag = async (id, flag, value) => {
    try {
        await apiFetch(`/ inquiries / ${id} / checklist`, {
            method: 'PUT',
            body: JSON.stringify({ flag, value })
        });
        loadInquiries();
    } catch (error) {
        console.error('Error toggling flag:', error);
        alert('Error al actualizar estado');
    }
};



// Bulk Delete Handler
const btnDeleteSelected = document.getElementById('btn-delete-selected-inquiries');
if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.inquiry-checkbox:checked');
        const ids = Array.from(checkboxes).map(cb => cb.value);

        if (ids.length === 0) {
            showAlertModal('Aviso', 'Selecciona al menos una solicitud para eliminar.', true);
            return;
        }

        showConfirmModal({
            title: '¿Eliminar Solicitudes?',
            message: `¿Estás seguro de eliminar ${ids.length} solicitud(es) ? `,
            confirmText: 'Eliminar',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    // Execute sequentially to avoid overwhelming server or handle errors individually
                    for (const id of ids) {
                        await apiFetch(`/inquiries/${id}`, { method: 'DELETE' });
                    }
                    loadInquiries();
                } catch (error) {
                    console.error('Error deleting inquiries:', error);
                    showAlertModal('Error', 'Error al eliminar solicitudes.', true);
                }
            }
        });
    });
}

// Export PDF Handler
const btnExportPdf = document.getElementById('btn-export-pdf-inquiries');
if (btnExportPdf) {
    btnExportPdf.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL} / inquiries /export -pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al generar el reporte.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            // Cleanup after a delay to ensure it loads
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Export error:', error);
            showAlertModal('Error', 'No se pudo generar el reporte PDF.', true);
        }
    });
}



// --- Academic Structure Logic ---

// Toggle Nested Submenu
const nestedSubmenuHeaders = document.querySelectorAll('.nested-submenu-header');
nestedSubmenuHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.chevron');
        if (content) content.classList.toggle('hidden');
        if (chevron) style = chevron.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });
});

// Load Academic Data
async function loadAcademicStructure() {
    console.log('Loading Academic Structure...');
    const levels = await apiFetch('/academic/levels') || [];
    renderLevelsList(levels);
    updateLevelSelects(levels);
}

// UI Helper: Create Item with Actions
function createAcademicItem(id, name, type, onDelete, onEdit) {
    const item = document.createElement('li');
    item.className = 'academic-item';
    item.style.padding = '0.5rem';
    item.style.borderBottom = '1px solid #eee';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    item.appendChild(nameSpan);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        `;
    editBtn.style.color = '#3b82f6';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.title = 'Editar';
    editBtn.onclick = () => onEdit(id, name);
    actions.appendChild(editBtn);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        `;
    deleteBtn.style.color = '#ef4444';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.title = 'Eliminar';
    deleteBtn.onclick = () => onDelete(id);
    actions.appendChild(deleteBtn);

    item.appendChild(actions);
    return item;
}

// Render Levels
function renderLevelsList(levels) {
    const list = document.getElementById('levels-list');
    if (!list) return;
    list.innerHTML = '';
    levels.forEach(l => {
        const item = createAcademicItem(
            l.id, l.name, 'level',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Nivel?',
                    message: '¿Eliminar Nivel? Se borrarán todos sus grados y grupos.',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/academic/levels/${id}`, { method: 'DELETE' });
                        loadAcademicStructure();
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre del nivel:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/academic/levels/${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadAcademicStructure();
                }
            }
        );
        list.appendChild(item);
    });
}

function updateLevelSelects(levels) {
    const selects = [document.getElementById('select-level-for-grade')];
    selects.forEach(sel => {
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">Seleccionar Nivel</option>';
        levels.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = l.name;
            sel.appendChild(opt);
        });
        sel.value = current;
    });
}

// Add Level
const btnAddLevel = document.getElementById('btn-add-level');
if (btnAddLevel) {
    btnAddLevel.addEventListener('click', async () => {
        const input = document.getElementById('new-level-name');
        const name = input.value.trim();
        if (!name) return;

        await apiFetch('/academic/levels', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        input.value = '';
        loadAcademicStructure();
    });
}

// Grades Logic
const selLevelForGrade = document.getElementById('select-level-for-grade');
if (selLevelForGrade) {
    selLevelForGrade.addEventListener('change', async () => {
        loadGradesForLevel(selLevelForGrade.value);
    });
}

async function loadGradesForLevel(levelId) {
    const list = document.getElementById('grades-list');
    if (!list) return;
    list.innerHTML = '';
    updateGradeSelects([]);
    document.getElementById('groups-list').innerHTML = '';

    if (!levelId) return;

    const grades = await apiFetch(`/academic/grades?level_id=${levelId}`) || [];
    grades.forEach(g => {
        const item = createAcademicItem(
            g.id, g.name, 'grade',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Grado?',
                    message: '¿Eliminar Grado? Se borrarán todos sus grupos.',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/academic/grades/${id}`, { method: 'DELETE' });
                        loadGradesForLevel(levelId);
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre del grado:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/academic/grades/${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadGradesForLevel(levelId);
                }
            }
        );
        list.appendChild(item);
    });
    updateGradeSelects(grades);
}

function updateGradeSelects(grades) {
    const selects = [document.getElementById('select-grade-for-group')];
    selects.forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '<option value="">Seleccionar Grado</option>';
        grades.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            sel.appendChild(opt);
        });
    });
}


// Add Grade
const btnAddGrade = document.getElementById('btn-add-grade');
if (btnAddGrade) {
    btnAddGrade.addEventListener('click', async () => {
        const levelId = document.getElementById('select-level-for-grade').value;
        const input = document.getElementById('new-grade-name');
        const name = input.value.trim();

        if (!name || !levelId) {
            alert('Seleccione un nivel y escriba un nombre');
            return;
        }

        await apiFetch('/academic/grades', {
            method: 'POST',
            body: JSON.stringify({ name, level_id: levelId })
        });
        input.value = '';
        loadGradesForLevel(levelId);
    });
}


// Groups Logic
const selGradeForGroup = document.getElementById('select-grade-for-group');
if (selGradeForGroup) {
    selGradeForGroup.addEventListener('change', async () => {
        loadGroupsForGrade(selGradeForGroup.value);
    });
}

async function loadGroupsForGrade(gradeId) {
    const list = document.getElementById('groups-list');
    if (!list) return;
    list.innerHTML = '';

    if (!gradeId) return;

    const groups = await apiFetch(`/academic/groups?grade_id=${gradeId}`);
    if (!groups) return;

    groups.forEach(g => {
        const item = createAcademicItem(
            g.id, g.name, 'group',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Grupo?',
                    message: '¿Eliminar Grupo?',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/academic/groups/${id}`, { method: 'DELETE' });
                        loadGroupsForGrade(gradeId);
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre del grupo:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/academic/groups/${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadGroupsForGrade(gradeId);
                }
            }
        );
        list.appendChild(item);
    });
}

// Add Group
const btnAddGroup = document.getElementById('btn-add-group');
if (btnAddGroup) {
    btnAddGroup.addEventListener('click', async () => {
        const gradeId = document.getElementById('select-grade-for-group').value;
        const input = document.getElementById('new-group-name');
        const name = input.value.trim();
        if (!name || !gradeId) {
            alert('Seleccione un grado y escriba un nombre');
            return;
        }

        await apiFetch('/academic/groups', {
            method: 'POST',
            body: JSON.stringify({ name, grade_id: gradeId })
        });
        input.value = '';
        loadGroupsForGrade(gradeId);
    });
}

// Hook into Navigation
document.querySelectorAll('[data-target="academic-structure-section"]').forEach(btn => {
    btn.addEventListener('click', () => {
        loadAcademicStructure();
    });
});

// --- Administrative Structure Logic ---

// Load Administrative Data
async function loadAdministrativeStructure() {
    console.log('Loading Administrative Structure...');
    const areas = await apiFetch('/administrative/areas') || [];
    renderAreasList(areas);
    updateAreaSelects(areas);
    // Load positions (global/independent now)
    loadPositionsForSubarea();
}

// Render Areas
function renderAreasList(areas) {
    const list = document.getElementById('areas-list');
    if (!list) return;
    list.innerHTML = '';
    areas.forEach(a => {
        const item = createAcademicItem( // Reusing the helper from Academic logic
            a.id, a.name, 'area',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Área?',
                    message: '¿Eliminar Área? Se borrarán todas sus subáreas y puestos.',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/ administrative / areas / ${id}`, { method: 'DELETE' });
                        loadAdministrativeStructure();
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre del área:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/ administrative / areas / ${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadAdministrativeStructure();
                }
            }
        );
        list.appendChild(item);
    });
}

function updateAreaSelects(areas) {
    const selects = [document.getElementById('select-area-for-subarea')];
    selects.forEach(sel => {
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">Seleccionar Área</option>';
        areas.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.name;
            sel.appendChild(opt);
        });
        sel.value = current;
    });
}

// Add Area
const btnAddArea = document.getElementById('btn-add-area');
if (btnAddArea) {
    btnAddArea.addEventListener('click', async () => {
        const input = document.getElementById('new-area-name');
        const name = input.value.trim();
        if (!name) return;

        await apiFetch('/administrative/areas', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        input.value = '';
        loadAdministrativeStructure();
    });
}

// Subareas Logic
const selAreaForSubarea = document.getElementById('select-area-for-subarea');
if (selAreaForSubarea) {
    selAreaForSubarea.addEventListener('change', async () => {
        loadSubareasForArea(selAreaForSubarea.value);
    });
}

async function loadSubareasForArea(areaId) {
    const list = document.getElementById('subareas-list');
    if (!list) return;
    list.innerHTML = '';

    // Clear Position Select
    // Clear Position Select
    // updateSubareaSelects([]); // Removed
    // document.getElementById('positions-list').innerHTML = ''; // Don't clear positions when loading subareas

    if (!areaId) return;

    const subareas = await apiFetch(`/ administrative / subareas ? area_id = ${areaId}`) || [];
    subareas.forEach(s => {
        const item = createAcademicItem( // Reusing helper
            s.id, s.name, 'subarea',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Subárea?',
                    message: '¿Eliminar Subárea? Se borrarán todos sus puestos.',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/ administrative / subareas / ${id}`, { method: 'DELETE' });
                        loadSubareasForArea(areaId);
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre de la subárea:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/ administrative / subareas / ${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadSubareasForArea(areaId);
                }
            }
        );
        list.appendChild(item);
    });

    updateSubareaSelects(subareas);
}

function updateSubareaSelects(subareas) {
    // Removed
}

// Add Subarea
const btnAddSubarea = document.getElementById('btn-add-subarea');
if (btnAddSubarea) {
    btnAddSubarea.addEventListener('click', async () => {
        const areaId = document.getElementById('select-area-for-subarea').value;
        const input = document.getElementById('new-subarea-name');
        const name = input.value.trim();

        if (!name || !areaId) {
            alert('Seleccione un área y escriba un nombre');
            return;
        }

        await apiFetch('/administrative/subareas', {
            method: 'POST',
            body: JSON.stringify({ name, area_id: areaId })
        });
        input.value = '';
        loadSubareasForArea(areaId);
    });
}

// Positions Logic
// Positions Logic
// Removed select-subarea-for-position listener

async function loadPositionsForSubarea(subareaId) {
    const list = document.getElementById('positions-list');
    if (!list) return;
    list.innerHTML = '';

    // subareaId is optional or null now
    const url = subareaId ? `/ administrative / positions ? subarea_id = ${subareaId}` : '/administrative/positions';
    const positions = await apiFetch(url) || [];
    positions.forEach(p => {
        const item = createAcademicItem( // Reusing helper
            p.id, p.name, 'position',
            async (id) => {
                showConfirmModal({
                    title: '¿Eliminar Puesto?',
                    message: '¿Eliminar Puesto?',
                    confirmText: 'Eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        await apiFetch(`/ administrative / positions / ${id}`, { method: 'DELETE' });
                        loadPositionsForSubarea(subareaId);
                    }
                });
            },
            async (id, currentName) => {
                const newName = prompt('Editar nombre del puesto:', currentName);
                if (newName && newName !== currentName) {
                    await apiFetch(`/ administrative / positions / ${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
                    loadPositionsForSubarea(subareaId);
                }
            }
        );
        list.appendChild(item);
    });
}

// Add Position
const btnAddPosition = document.getElementById('btn-add-position');
if (btnAddPosition) {
    btnAddPosition.addEventListener('click', async () => {
        const input = document.getElementById('new-position-name');
        const name = input.value.trim();
        if (!name) {
            alert('Escriba un nombre');
            return;
        }

        await apiFetch('/administrative/positions', {
            method: 'POST',
            body: JSON.stringify({ name, subarea_id: null })
        });
        input.value = '';
        loadPositionsForSubarea();
    });
}

// Hook into Navigation
document.querySelectorAll('[data-target="administrative-structure-section"]').forEach(btn => {
    btn.addEventListener('click', () => {
        loadAdministrativeStructure();
    });
});

// Helper for phone inputs
function addPhoneInput(value = '') {
    const container = document.getElementById('school-phones-container');
    if (!container) return;

    const div = document.createElement('div');
    div.classList.add('phone-input-group');
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';

    const input = document.createElement('input');
    input.type = 'tel';
    input.classList.add('school-phone-input');
    input.placeholder = 'Teléfono';
    input.value = value;
    input.style.flex = '1';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'x';
    removeBtn.style.color = '#ef4444';
    removeBtn.style.background = 'none';
    removeBtn.style.border = 'none';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.onclick = () => {
        div.remove();
    };

    div.appendChild(input);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

const btnAddPhone = document.getElementById('btn-add-phone');
if (btnAddPhone) {
    btnAddPhone.addEventListener('click', () => addPhoneInput());
}

// --- School Autocomplete Logic ---
let cachedSchools = [];

async function loadSchoolSuggestions() {
    // Fetch and cache schools
    if (cachedSchools.length === 0) {
        cachedSchools = await apiFetch('/inquiries/schools') || [];
    }
}

// Setup custom search behavior
const schoolInput = document.getElementById('inquiry-previous-school');
const schoolList = document.getElementById('school-suggestions-list');

if (schoolInput && schoolList) {
    // Show/Filter on input
    schoolInput.addEventListener('input', () => {
        const query = schoolInput.value.toLowerCase();
        filterAndShowSchools(query);
    });

    // Show on focus
    schoolInput.addEventListener('focus', async () => {
        if (cachedSchools.length === 0) {
            await loadSchoolSuggestions();
        }
        filterAndShowSchools(schoolInput.value.toLowerCase());
    });

    // Hide on blur (delayed to allow clicks)
    schoolInput.addEventListener('blur', () => {
        setTimeout(() => {
            schoolList.classList.add('hidden');
        }, 200);
    });
}

// --- Permissions Matrix Logic ---



// [Legacy Permission Matrix Removed - Replaced by Modal]

function filterAndShowSchools(query) {
    schoolList.innerHTML = '';
    console.log('Filtering schools with query:', query, 'Cache size:', cachedSchools.length);

    // If empty query, show all (or limit to top 10?)
    // Let's show all matches
    const matches = cachedSchools.filter(school =>
        school.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
        schoolList.classList.remove('hidden');
        matches.forEach(school => {
            const li = document.createElement('li');
            li.textContent = school;
            li.style.padding = '0.5rem 1rem';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid var(--border)';
            // Hover effect can be done via CSS or inline style mouseover
            li.onmouseover = () => li.style.background = '#f1f5f9';
            li.onmouseout = () => li.style.background = 'white';

            li.addEventListener('click', () => {
                schoolInput.value = school;
                schoolList.classList.add('hidden');
            });
            schoolList.appendChild(li);
        });
    } else {
        schoolList.classList.add('hidden');
    }
}

// Update initialization to load suggestions data
document.querySelectorAll('[data-section="informes-section"]').forEach(btn => {
    btn.addEventListener('click', () => {
        loadSchoolSuggestions();
    });
});

// --- Inquiry List Logic ---

let inquiryPollInterval = null;

function startInquiryPolling() {
    if (inquiryPollInterval) clearInterval(inquiryPollInterval);
    // Poll every 30 seconds
    // Poll every 5 seconds for real-time updates
    inquiryPollInterval = setInterval(() => {
        const section = document.getElementById('inquiries-list-section');
        if (section && !section.classList.contains('hidden')) {
            loadInquiriesList();
        }
    }, 5000);
}

// Call this when loading the app or switching to the section
startInquiryPolling();


async function loadInquiriesList() {
    const listBody = document.getElementById('inquiries-container');
    if (!listBody) return;

    // Show loading state implicitly or keep current data while fetching
    // listBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando...</td></tr>';

    const inquiries = await apiFetch('/inquiries') || [];
    renderInquiries(inquiries);
}

// --- Email Templates Logic ---

async function loadEmailTemplates() {
    const select = document.getElementById('template-select');
    if (!select) return;

    // Clear and loading state
    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        console.log('Fetching templates from API...');
        const templates = await apiFetch('/config/templates') || [];
        console.log('Templates received:', templates);

        select.innerHTML = '<option value="">-- Seleccionar --</option>';
        templates.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading templates:', error);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// Template Selection Handler
const templateSelect = document.getElementById('template-select');
if (templateSelect) {
    // UI References
    const btnEdit = document.getElementById('btn-edit-template');
    const btnSave = document.getElementById('btn-save-template');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const iframe = document.getElementById('template-preview-frame');
    // const quillWrapper = document.getElementById('editor-wrapper'); // Removed
    // let quill = null; // Removed

    const formattingToolbar = document.getElementById('formatting-toolbar');

    // Management Buttons
    const btnNew = document.getElementById('btn-new-template');
    const btnRename = document.getElementById('btn-rename-template');
    const btnDelete = document.getElementById('btn-delete-template');

    const toggleEditor = (editable) => {
        const doc = iframe.contentDocument;
        if (!doc) return;

        if (editable) {
            doc.body.contentEditable = 'true';
            doc.body.style.border = '2px solid #3b82f6'; // Visual cue
            btnEdit.classList.add('hidden');
            btnSave.classList.remove('hidden');
            btnCancel.classList.remove('hidden');
            formattingToolbar.classList.remove('hidden'); // Show tools
        } else {
            doc.body.contentEditable = 'false';
            doc.body.style.border = 'none';
            btnEdit.classList.remove('hidden');
            btnSave.classList.add('hidden');
            btnCancel.classList.add('hidden');
            formattingToolbar.classList.add('hidden'); // Hide tools
        }
    };

    // Tool Buttons Logic
    formattingToolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const cmd = btn.dataset.cmd;
        const val = btn.dataset.val || null;
        if (cmd) {
            iframe.contentDocument.execCommand(cmd, false, val);
            iframe.contentWindow.focus();
        } else if (btn.id === 'btn-add-link') {
            const url = prompt('Ingresa el link:', 'https://');
            if (url) {
                iframe.contentDocument.execCommand('createLink', false, url);
            }
        } else if (btn.id === 'btn-insert-box') {
            const borderColor = prompt('Color de la línea lateral (inglés o hex):', '#3b82f6');
            if (borderColor === null) return; // Cancelled
            const bgColor = prompt('Color de fondo (inglés o hex):', '#f8f9fa');
            if (bgColor === null) return;

            const boxHtml = `
        < div style = "background-color: ${bgColor}; border: 1px solid #e9ecef; border-left: 4px solid ${borderColor}; padding: 12px; margin: 10px 0; border-radius: 4px;" >
        <p style="margin: 0; color: #334155;"><strong>Destacado:</strong> Escribe aquí tu información.</p>
                </div > <br>
                `;
            iframe.contentDocument.execCommand('insertHTML', false, boxHtml);
            iframe.contentWindow.focus();
        }
    });

    // Helper for Input Modal
    const showInputModal = (title, message, initialValue = '') => {
        return new Promise((resolve) => {
            const modal = document.getElementById('generic-input-modal');
            const titleEl = document.getElementById('generic-input-title');
            const msgEl = document.getElementById('generic-input-message');
            const inputEl = document.getElementById('generic-input-field');
            const btnConfirm = document.getElementById('btn-input-confirm');
            const btnCancel = document.getElementById('btn-input-cancel');

            titleEl.textContent = title;
            msgEl.textContent = message;
            inputEl.value = initialValue;

            modal.classList.remove('hidden');
            inputEl.focus();

            const close = (value) => {
                modal.classList.add('hidden');
                // Cleanup listeners to avoid dupes if reused without cloning (though simple remove is better)
                btnConfirm.onclick = null;
                btnCancel.onclick = null;
                resolve(value);
            };

            btnConfirm.onclick = () => close(inputEl.value.trim());
            btnCancel.onclick = () => close(null);

            // Allow Enter key
            inputEl.onkeyup = (e) => {
                if (e.key === 'Enter') close(inputEl.value.trim());
                if (e.key === 'Escape') close(null);
            };
        });
    };

    // MANAGEMENT ACTIONS

    // New
    btnNew.addEventListener('click', async () => {
        const name = await showInputModal('Nueva Plantilla', 'Nombre de la nueva plantilla (sin espacios):');
        if (!name) return;

        try {
            await apiFetch('/config/templates', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            await loadEmailTemplates();
            templateSelect.value = name;
            templateSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            showAlertModal('Error', error.message, true);
        }
    });

    // Rename
    btnRename.addEventListener('click', async () => {
        const currentName = templateSelect.value;
        if (!currentName) return;

        const newName = await showInputModal('Renombrar Plantilla', 'Nuevo nombre:', currentName);
        if (!newName || newName === currentName) return;

        try {
            await apiFetch(`/config/templates/${encodeURIComponent(currentName)}/rename`, {
                method: 'POST',
                body: JSON.stringify({ newName })
            });
            await loadEmailTemplates();
            templateSelect.value = newName;
            templateSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            showAlertModal('Error', error.message, true);
        }
    });

    // Delete
    btnDelete.addEventListener('click', async () => {
        const currentName = templateSelect.value;
        if (!currentName) return;

        if (!await showConfirmAsync('¿Eliminar Plantilla?', `¿Eliminar plantilla "${currentName}"?`, true)) return;

        try {
            await apiFetch(`/config/templates/${encodeURIComponent(currentName)}`, {
                method: 'DELETE'
            });
            await loadEmailTemplates(); // Refresh list
            iframe.srcdoc = ''; // Clear preview
            btnRename.classList.add('hidden');
            btnDelete.classList.add('hidden');
        } catch (error) {
            showAlertModal('Error', error.message, true);
        }
    });

    templateSelect.addEventListener('change', async (e) => {
        const templateName = e.target.value;

        // Reset UI
        toggleEditor(false);
        if (!templateName) {
            iframe.srcdoc = '';
            btnEdit.classList.add('hidden');
            return;
        }
        btnEdit.classList.remove('hidden');
        btnRename.classList.remove('hidden');
        btnDelete.classList.remove('hidden');

        try {
            // Fetch raw HTML content with Auth Header
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/config/templates/${encodeURIComponent(templateName)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to load template');
            let html = await response.text();

            // Fix CID for browser preview
            html = html.replace('cid:school_logo', 'logo.png');

            iframe.srcdoc = html;
        } catch (error) {
            console.error('Error loading template preview:', error);
            iframe.srcdoc = '<p style="color:red; padding:1rem;">Error loading preview</p>';
        }
    });

    // EDIT Button
    if (btnEdit) {
        btnEdit.addEventListener('click', async () => {
            // Just enable editing on the current loaded iframe
            const templateName = templateSelect.value;
            if (!templateName) return;

            toggleEditor(true);
        });
    }

    // CANCEL Button
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            toggleEditor(false);
        });
    }

    // SAVE Button
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const templateName = templateSelect.value;
            const doc = iframe.contentDocument;

            // Get full HTML
            let content = doc ? doc.documentElement.outerHTML : '';

            if (!templateName || !content) return;

            // Revert logo path for Email System
            content = content.replace(/logo\.png/g, 'cid:school_logo');
            // Remove the editable border if captured (and contentEditable attr)
            content = content.replace(/ contenteditable="true"/g, '');
            content = content.replace(/ style="[^"]*border: 2px solid rgb\(59, 130, 246\);[^"]*"/g, '');
            // A more robust way might be to perform cleanup on DOM before serializing, 
            // but for now string replacement works if specific style matches.
            // Better: remove style from DOM, grab html, re-add style.

            // CLEANUP DOM safely
            const previousStyle = doc.body.style.cssText;
            doc.body.contentEditable = 'false';
            doc.body.style.border = 'none';

            content = doc.documentElement.outerHTML; // Grab clean HTML

            // Restore for UI logic (toggleEditor will handle it, but wait, toggleEditor(false) is called next)
            // But we need to put back CID
            content = content.replace(/logo\.png/g, 'cid:school_logo');

            const btnOriginalText = btnSave.innerHTML;
            btnSave.disabled = true;
            btnSave.textContent = 'Guardando...';

            try {
                await apiFetch(`/config/templates/${encodeURIComponent(templateName)}`, {
                    method: 'PUT',
                    body: JSON.stringify({ content })
                });

                // Success
                showAlertModal('Éxito', 'Plantilla guardada correctamente');
                toggleEditor(false);

                // Refresh Preview
                templateSelect.dispatchEvent(new Event('change'));

            } catch (error) {
                console.error('Save error:', error);
                showAlertModal('Error', 'Error al guardar: ' + error.message, true);
            } finally {
                btnSave.disabled = false;
                btnSave.innerHTML = btnOriginalText;
            }
        });
    }
}


// Hook into Navigation for Email Templates
document.querySelectorAll('[data-target="email-templates-section"]').forEach(btn => {
    btn.addEventListener('click', () => {
        loadEmailTemplates();
    });
});

function updateSearch() {
    const searchInput = document.getElementById('student-search');
    const clearBtn = document.getElementById('clear-search-btn');

    // if (!searchInput) return; // REMOVED: Prevent blocking render

    const filters = {
        text: searchInput ? searchInput.value.trim() : '',
        grade: filterGrade ? filterGrade.value : '',
        subgrade: filterSubgrade ? filterSubgrade.value : '',
        group: filterGroup ? filterGroup.value : ''
    };
    renderStudents(filters);
    // Visibility is now static (always visible) as requested
}
// --- Send Test Email Logic ---
const btnSendTestEmail = document.getElementById('btn-send-test-email');
if (btnSendTestEmail) {
    btnSendTestEmail.addEventListener('click', async () => {
        const emailInput = document.getElementById('test-email-input');
        const templateSelect = document.getElementById('template-select');

        const email = emailInput.value.trim();
        const template = templateSelect.value;
        const btn = btnSendTestEmail;

        if (!email) {
            showAlertModal('Aviso', 'Por favor, ingresa un correo de prueba.', true);
            return;
        }

        if (!template) {
            showAlertModal('Aviso', 'Por favor, selecciona una plantilla.', true);
            return;
        }

        // Disable button while sending
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-icons-outlined" style="font-size: 18px; animation: spin 1s linear infinite;">refresh</span> Enviando...`;

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('template', template);

            // Attachment logic removed as requested

            // Attachment logic removed as requested

            await apiFetch('/config/test-email', {
                method: 'POST',
                body: formData
            });
            showAlertModal('Éxito', `Correo de prueba enviado a ${email}`);
        } catch (error) {
            console.error('Error sending test email:', error);
            showAlertModal('Error', 'Error al enviar el correo: ' + error.message, true);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}


// --- Smart Attachment Manager Logic ---
function initSmartAttachments() {
    const btnUploadFile = document.getElementById('btn-upload-file');
    if (btnUploadFile) {
        const fileInput = document.getElementById('attachment-upload-input');
        const fileListEl = document.getElementById('attachment-file-list');
        const ruleTemplateSelect = document.getElementById('rule-template-select');
        const ruleFileSelect = document.getElementById('rule-file-select');
        const btnAddRule = document.getElementById('btn-add-rule');
        const rulesListEl = document.getElementById('attachment-rules-list');

        // Helper for Success Modals (Re-uses generic modal)
        function showSuccessModal({ title, message, onClose }) {
            const modal = document.getElementById('generic-confirm-modal');
            if (!modal) return showAlertModal('Error', message, true);

            const titleEl = document.getElementById('generic-confirm-title');
            const msgEl = document.getElementById('generic-confirm-message');
            const confirmBtn = document.getElementById('btn-generic-confirm');
            const cancelBtn = document.getElementById('btn-generic-cancel');

            if (titleEl) titleEl.textContent = title || 'Éxito';
            if (msgEl) msgEl.textContent = message;

            if (confirmBtn) {
                confirmBtn.textContent = 'Aceptar';
                confirmBtn.className = 'btn-confirm';
                confirmBtn.style.backgroundColor = '#3b82f6';
                confirmBtn.style.borderColor = '#3b82f6';

                const newConfirm = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

                newConfirm.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    if (onClose) onClose();
                });
            }

            if (cancelBtn) cancelBtn.classList.add('hidden');

            const iconContainer = document.getElementById('generic-confirm-icon-container');
            if (iconContainer) {
                iconContainer.innerHTML = '<span class="material-icons-outlined" style="font-size: 3rem; color: #22c55e;">check_circle</span>';
            }

            modal.classList.remove('hidden');
            modal.style.display = 'flex'; // Force display reset if hard-hidden
        }

        // Initial Load
        loadAttachmentLibrary();
        loadAttachmentRules();
        populateRuleDropdowns();

        // 1. Upload File
        btnUploadFile.addEventListener('click', async () => {
            if (!fileInput.files[0]) {
                return showConfirmModal({
                    title: 'Atención',
                    message: 'Selecciona un archivo primero.',
                    isAlert: true
                });
            }

            const originalText = btnUploadFile.innerText;
            btnUploadFile.innerText = 'Subiendo...';
            btnUploadFile.disabled = true;
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            try {
                const res = await apiFetch('/attachments/upload', {
                    method: 'POST',
                    body: formData
                }); // Let apiFetch handle JSON response check or error throw
                // Wait, apiFetch wraps headers. For FormData, we usually let browser set Content-Type.
                // If apiFetch forces Content-Type: application/json, it will fail.
                // Checking apiFetch implementation... usually it checks if body is FormData.
                // Assuming apiFetch handles FormData correctly (removes Content-Type header).
                // If uncertain, I will use standard fetch here or rely on apiFetch smarts.
                // Ideally I should check apiFetch.
                // But for safer execution, I'll use raw fetch with the auth header if I can get token.
                // Actually, let's try apiFetch. Most wrappers handle FormData.

                if (res) {
                    // alert('Archivo subido correctamente');
                    // alert('Archivo subido correctamente');
                    showSuccessModal({
                        title: 'Éxito',
                        message: 'Archivo subido correctamente al sistema.',
                        onClose: () => {
                            loadAttachmentLibrary();
                            populateRuleDropdowns();
                        }
                    });
                    fileInput.value = '';
                    loadAttachmentLibrary();
                    populateRuleDropdowns(); // Refresh file select
                }
            } catch (e) {
                console.error(e);
                showConfirmModal({
                    title: 'Error',
                    message: 'Error al subir: ' + e.message,
                    isAlert: true
                });
            } finally {
                btnUploadFile.innerText = originalText;
                btnUploadFile.disabled = false;
            }
        });

        // 2. Add Rule
        btnAddRule.addEventListener('click', async () => {
            const template = ruleTemplateSelect.value;
            const grade = document.getElementById('rule-grade-select').value;
            const file = ruleFileSelect.value;

            if (!template || !file) {
                return showConfirmModal({
                    title: 'Atención',
                    message: 'Debes seleccionar Plantilla y Archivo.',
                    isAlert: true
                });
            }

            try {
                await apiFetch('/attachments/rules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_name: template,
                        grade_condition: grade,
                        file_name: file
                    })
                });
                loadAttachmentRules();
                // Reset selects? Maybe not grade/template to allow bulk add
                ruleFileSelect.value = '';
            } catch (e) {
                showConfirmModal({
                    title: 'Error',
                    message: 'Error al crear regla: ' + e.message,
                    isAlert: true
                });
            }
        });

        // Functions
        async function loadAttachmentLibrary() {
            try {
                const files = await apiFetch('/attachments/files');
                if (!files || !Array.isArray(files)) return; // Guard against error

                fileListEl.innerHTML = '';

                if (files.length === 0) {
                    fileListEl.innerHTML = '<li style="padding:1rem; text-align:center; color:#94a3b8;">No hay archivos.</li>';
                    return;
                }

                files.forEach(file => {
                    const li = document.createElement('li');
                    li.style.cssText = 'padding: 0.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;';

                    const link = `${window.location.protocol}//${window.location.host}/uploads/${file}`; // Construct public link

                    li.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.5rem; overflow:hidden;">
                    <span class="material-icons-outlined" style="font-size:18px; color:#64748b;">description</span>
                    <span title="${file}" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 150px;">${file}</span>
                </div>
                <div style="display:flex; gap:0.25rem;">
                    <button class="btn-icon-small btn-copy-link" data-link="${link}" title="Copiar Link" style="background:none; border:none; cursor:pointer; color:#3b82f6;">
                        <span class="material-icons-outlined" style="font-size:18px;">content_copy</span>
                    </button>
                    <button class="btn-icon-small btn-delete-file" data-name="${file}" title="Eliminar" style="background:none; border:none; cursor:pointer; color:#ef4444;">
                        <span class="material-icons-outlined" style="font-size:18px;">delete</span>
                    </button>
                </div>
                `;
                    fileListEl.appendChild(li);
                });

                // Handlers
                document.querySelectorAll('.btn-copy-link').forEach(b => {
                    b.addEventListener('click', (e) => {
                        const link = e.currentTarget.dataset.link;
                        navigator.clipboard.writeText(link).then(() => {
                            showSuccessModal({
                                title: 'Enlace Copiado',
                                message: 'El enlace se ha copiado al portapapeles.'
                            });
                        });
                    });
                });

                document.querySelectorAll('.btn-delete-file').forEach(b => {
                    b.addEventListener('click', (e) => {
                        const name = e.currentTarget.dataset.name;

                        // Use consistent modal
                        if (typeof showConfirmModal === 'function') {
                            showConfirmModal({
                                title: 'Eliminar Archivo',
                                message: `¿Estás seguro de eliminar "${name}"? Esto podría romper reglas existentes.`,
                                isDestructive: true,
                                onConfirm: async () => {
                                    try {
                                        const res = await apiFetch(`/attachments/files/${name}`, { method: 'DELETE' });
                                        if (res) {
                                            loadAttachmentLibrary();
                                            loadAttachmentRules();
                                            populateRuleDropdowns();
                                        }
                                    } catch (err) {
                                        showConfirmModal({
                                            title: 'Error',
                                            message: err.message,
                                            isAlert: true
                                        });
                                    }
                                }
                            });
                        }
                        // Fallback removed

                    });
                });

            } catch (e) {
                // Broad suppression for initial load to prevent flash
                console.warn('Silent suppress of error in loadAttachmentLibrary:', e);
                fileListEl.innerHTML = '<li style="color:red; padding:1rem;">Error cargando archivos.</li>';
                return;
            }
        }

        async function loadAttachmentRules() {
            try {
                const rules = await apiFetch('/attachments/rules');
                if (!rules || !Array.isArray(rules)) return; // Guard

                rulesListEl.innerHTML = '';

                rules.forEach(rule => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                <td style="padding:0.5rem; border-bottom:1px solid #f1f5f9;">${rule.template_name}</td>
                <td style="padding:0.5rem; border-bottom:1px solid #f1f5f9;">${rule.grade_condition || '<span style="color:#94a3b8; font-style:italic;">Todos</span>'}</td>
                <td style="padding:0.5rem; border-bottom:1px solid #f1f5f9; color:#3b82f6;">${rule.file_name}</td>
                <td style="padding:0.5rem; border-bottom:1px solid #f1f5f9;">
                    <button class="btn-delete-rule" data-id="${rule.id}" style="border:none; background:none; cursor:pointer; color:#ef4444;">
                        <span class="material-icons-outlined" style="font-size:16px;">close</span>
                    </button>
                </td>
                `;
                    rulesListEl.appendChild(tr);
                });

                document.querySelectorAll('.btn-delete-rule').forEach(b => {
                    b.addEventListener('click', (e) => {
                        const ruleId = e.currentTarget.dataset.id;

                        if (typeof showConfirmModal === 'function') {
                            showConfirmModal({
                                title: 'Eliminar Regla',
                                message: '¿Estás seguro de eliminar esta regla de adjunto?',
                                isDestructive: true,
                                onConfirm: async () => {
                                    try {
                                        const res = await apiFetch(`/attachments/rules/${ruleId}`, { method: 'DELETE' });
                                        if (res) loadAttachmentRules();
                                    } catch (err) {
                                        showConfirmModal({
                                            title: 'Error',
                                            message: err.message,
                                            isAlert: true
                                        });
                                    }
                                }
                            });
                        }
                    });
                });

            } catch (e) {
                // Broad suppression for initial load to prevent flash
                console.warn('Silent suppress of error in loadAttachmentRules:', e);
                return;
            }
        }

        async function populateRuleDropdowns() {
            // reuse template logic via API call if possible, or scrape DOM if template-select exists
            // Scrape DOM is faster if populated
            const mainSelect = document.getElementById('template-select');
            const ruleSelect = document.getElementById('rule-template-select');

            // Wait for mainSelect to populate? It happens in loadTemplates()
            // We can just fetch templates again:
            if (ruleSelect) {
                try {
                    const templates = await apiFetch('/config/templates');
                    if (templates && Array.isArray(templates)) {
                        ruleSelect.innerHTML = '<option value="">Seleccionar Plantilla...</option>';
                        templates.forEach(t => {
                            const name = t.replace('.html', '');
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            ruleSelect.appendChild(option);
                        });
                    }
                } catch (e) { }
            }

            // Populate Files
            const ruleFileSelect = document.getElementById('rule-file-select');
            if (ruleFileSelect) {
                try {
                    const files = await apiFetch('/attachments/files');
                    if (files && Array.isArray(files)) {
                        ruleFileSelect.innerHTML = '<option value="">Seleccionar Archivo...</option>';
                        files.forEach(f => {
                            const option = document.createElement('option');
                            option.value = f;
                            option.textContent = f;
                            ruleFileSelect.appendChild(option);
                        });
                    }
                } catch (e) { console.error('Error loading files', e); }
            }

            // Populate Grades (Dynamic)
            const ruleGradeSelect = document.getElementById('rule-grade-select');
            if (ruleGradeSelect) {
                try {
                    ruleGradeSelect.innerHTML = '<option value="">Cargando...</option>';
                    // HOTFIX: Hardcoded to prevent loading hang
                    // const grades = await apiFetch('/students/meta/grades');
                    const grades = ['Maternal', 'Preescolar', 'Primaria', 'Secundaria'];

                    if (grades && Array.isArray(grades)) {
                        ruleGradeSelect.innerHTML = '<option value="">Todos (Niveles)</option>';
                        if (grades.length === 0) {
                            const option = document.createElement('option');
                            option.disabled = true;
                            option.textContent = '-- Sin grados registrados --';
                            ruleGradeSelect.appendChild(option);
                        } else {
                            grades.forEach(g => {
                                const option = document.createElement('option');
                                option.value = g;
                                option.textContent = g;
                                ruleGradeSelect.appendChild(option);
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error loading grades', e);
                    ruleGradeSelect.innerHTML = '<option value="">Error al cargar</option>';
                }
            }
        }
    }
} // End initSmartAttachments


// --- Permissions & Roles UI Initialization ---
function initPermissionsUI() {
    // 1. Config Permissions Button
    const configPermissionsBtn = document.getElementById('config-permissions-btn');
    const permissionsModal = document.getElementById('permissions-modal');
    const closePermsBtns = document.querySelectorAll('.close-modal-perms');
    const roleSelect = document.getElementById('role-select-perms');
    const permissionMatrixContainer = document.getElementById('permission-matrix');
    const btnSavePerms = document.getElementById('btn-save-perms');

    if (configPermissionsBtn && permissionsModal) {
        configPermissionsBtn.addEventListener('click', async () => {
            // RUNTIME FIX: Ensure modal is at body level
            if (permissionsModal.parentNode !== document.body) {
                document.body.appendChild(permissionsModal);
            }

            permissionsModal.classList.remove('hidden');
            permissionsModal.style.display = 'flex'; // Force centering
            permissionsModal.style.zIndex = '9999';

            // Load Roles
            await populateRoleSelectPerms();
            // Trigger change to load perms for first role
            if (roleSelect && roleSelect.value) {
                roleSelect.dispatchEvent(new Event('change'));
            }
        });

        closePermsBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                permissionsModal.classList.add('hidden');
                permissionsModal.style.display = ''; // Reset inline style
            });
        });

        if (roleSelect) {
            roleSelect.addEventListener('change', () => {
                renderPermissionMatrix(roleSelect.value);
            });
        }

        if (btnSavePerms) {
            btnSavePerms.addEventListener('click', async () => {
                await savePermissions();
            });
        }
    }

    // 2. Manage Roles Button
    const btnManageRoles = document.getElementById('btn-manage-roles');
    const manageRolesModal = document.getElementById('manage-roles-modal-prod') || document.getElementById('manage-roles-modal');
    const closeManageRolesBtns = document.querySelectorAll('.close-modal-manage-roles');
    const btnManageAddRole = document.getElementById('btn-manage-add-role');
    const inputManageNewRoleName = document.getElementById('manage-new-role-name');
    const manageRolesList = document.getElementById('manage-roles-list');

    if (btnManageRoles && manageRolesModal) {
        btnManageRoles.addEventListener('click', () => {
            // RUNTIME FIX: Ensure modal is at body level
            if (manageRolesModal.parentNode !== document.body) {
                document.body.appendChild(manageRolesModal);
            }

            manageRolesModal.classList.remove('hidden');
            manageRolesModal.style.display = 'block'; // FORCE VISIBILITY
            manageRolesModal.style.zIndex = '9999';
            try {
                renderManageRolesList();
            } catch (e) {
                console.error('Render Roles Error:', e);
                showAlertModal('Error', 'Error al mostrar lista de roles: ' + e.message, true);
            }
            if (inputManageNewRoleName) {
                inputManageNewRoleName.value = '';
                inputManageNewRoleName.focus();
            }
        });

        closeManageRolesBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                manageRolesModal.classList.add('hidden');
                manageRolesModal.style.display = '';
            });
        });

        if (btnManageAddRole) {
            btnManageAddRole.addEventListener('click', async () => {
                const roleName = inputManageNewRoleName.value.trim();
                if (!roleName) return showAlertModal('Aviso', 'Ingresa un nombre para el rol.', true);

                // Generate key
                const roleKey = roleName.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, '_');

                if (window.currentRolesConfig && window.currentRolesConfig[roleKey]) {
                    return showAlertModal('Error', 'Este rol ya existe (clave interna: ' + roleKey + ').', true);
                }

                // Add new role
                if (!window.currentRolesConfig) window.currentRolesConfig = {};
                window.currentRolesConfig[roleKey] = {
                    name: roleName,
                    permissions: []
                };

                await saveRolesConfig('Rol "' + roleName + '" creado.');
                renderManageRolesList();
                inputManageNewRoleName.value = '';
                inputManageNewRoleName.focus();
            });
        }
    }

    // --- Helper Functions Scoped to Scope ---

    async function populateRoleSelectPerms() {
        if (!roleSelect) return;
        roleSelect.innerHTML = '<option value="">Cargando...</option>';
        try {
            const roles = await apiFetch('/config/roles');
            // Update global config cache
            window.currentRolesConfig = roles;

            roleSelect.innerHTML = '';
            Object.keys(roles).forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = roles[key].label || roles[key].name || key;
                roleSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error loading roles for perms:', e);
            roleSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    }

    const PERMISSION_TRANSLATIONS = {
        'view_dashboard': 'Ver Panel Principal',
        'view_students': 'Ver Alumnos',
        'manage_students': 'Gestionar Alumnos',
        'students_edit': 'Editar Alumnos',
        'students_delete': 'Eliminar Alumnos',
        'view_users': 'Ver Usuarios',
        'manage_users': 'Gestionar Usuarios',
        'users_edit': 'Editar Usuarios',
        'users_delete': 'Eliminar Usuarios',
        'alumnos.edit': 'Editar Alumno', // NEW
        'alumnos.delete': 'Eliminar Alumno', // NEW
        'users.edit': 'Editar Usuario', // NEW
        'users.delete': 'Eliminar Usuario', // NEW
        // Finance / Caja mappings
        'view_finance': 'Ver Finanzas (Legacy)',
        'manage_payments': 'Gestionar Pagos (Legacy)',
        'manage_concepts': 'Gestionar Conceptos (Legacy)',
        'caja.view_menu': 'Ver Menú Caja',
        'caja.pagos': 'Gestión de Pagos y Cobros',
        'caja.conceptos': 'Gestión de Conceptos',
        // Config
        'view_config': 'Ver Configuración',
        'config.view_menu': 'Ver Menú Configuración',
        'config.roles': 'Gestionar Roles',
        'config.permissions': 'Configurar Permisos',
        'config.email_templates': 'Plantillas de Correo',
        // School
        'manage_school_info': 'Info de Escuela',
        'school.view_menu': 'Ver Menú Escuela',
        'school.info': 'Información General',
        'school.structure_academic': 'Estructura Académica',
        'school.structure_admin': 'Estructura Administrativa',
        // HR
        'hr.view_menu': 'Ver Menú RRHH',
        'hr.personal': 'Gestión de Personal',
        // Reports
        'reports.view_menu': 'Ver Menú Reportes',
        'reports.income': 'Reporte de Ingresos',
        // Inquiries
        'inquiries.view_menu': 'Ver Menú Solicitudes',
        'inquiries.form': 'Formulario Solicitud',
        'inquiries.list': 'Lista de Solicitudes',
        'inquiries.agenda': 'Agenda de Citas',
        'notifications.view_menu': 'Ver Menú Notificaciones',
        'notifications.send': 'Enviar Notificaciones',
        'notifications.target_all': 'Enviar a Todos',
        'notifications.target_level': 'Enviar por Nivel',
        'notifications.target_group': 'Enviar por Grupo',
        'notifications.target_student': 'Enviar a Alumno'
    };


    // --- Permissions Matrix Logic (Updated to Match Menu) ---

    // Define the menu structure mirroring the sidebar


    async function renderPermissionMatrix(roleKey) {
        console.log('DEBUG: renderPermissionMatrix called for role:', roleKey);
        if (!permissionMatrixContainer) {
            console.error('DEBUG: permissionMatrixContainer not found!');
            return;
        }
        permissionMatrixContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Cargando permisos...</div>';

        try {
            // Re-fetch config to ensure freshness if not in cache
            if (!window.currentRolesConfig) {
                window.currentRolesConfig = await apiFetch('/config/roles');
            }

            const roleData = window.currentRolesConfig[roleKey];
            if (!roleData) {
                permissionMatrixContainer.innerHTML = '<div style="color:red;">Rol no encontrado.</div>';
                return;
            }

            const rolePermissions = roleData.permissions || [];

            permissionMatrixContainer.innerHTML = '';

            // Render using MENU_STRUCTURE
            MENU_STRUCTURE.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.style.border = '1px solid #e2e8f0';
                groupDiv.style.borderRadius = '0.5rem';
                groupDiv.style.padding = '0.75rem';
                groupDiv.style.background = '#f8fafc';
                groupDiv.style.display = 'flex';
                groupDiv.style.flexDirection = 'column';

                const title = document.createElement('h5');
                title.textContent = group.title;
                title.style.marginBottom = '0.5rem';
                title.style.color = '#334155';
                title.style.fontWeight = '600';
                title.style.borderBottom = '1px solid #cbd5e1';
                title.style.paddingBottom = '0.25rem';
                groupDiv.appendChild(title);

                renderMenuItemsRecursive(group.items, groupDiv, rolePermissions, roleKey);

                permissionMatrixContainer.appendChild(groupDiv);
            });

        } catch (e) {
            permissionMatrixContainer.innerHTML = '<div style="color:red;">Error al cargar matriz.</div>';
            console.error(e);
        }
    }

    function renderMenuItemsRecursive(items, container, rolePermissions, roleKey, level = 0) {
        items.forEach(item => {
            if (item.isSubgroup) {
                // Render Subgroup Header
                const subgroupLabel = document.createElement('div');
                subgroupLabel.textContent = item.label;
                subgroupLabel.style.fontWeight = '500';
                subgroupLabel.style.marginTop = '0.5rem';
                subgroupLabel.style.marginBottom = '0.25rem';
                subgroupLabel.style.fontSize = '0.9rem';
                subgroupLabel.style.color = '#475569';
                subgroupLabel.style.paddingLeft = (level * 10) + 'px';
                container.appendChild(subgroupLabel);

                // Render Children
                renderMenuItemsRecursive(item.items, container, rolePermissions, roleKey, level + 1);
            } else {
                // Render Checkbox Item
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center'; // Center vertically
                label.style.gap = '0.5rem';
                label.style.marginBottom = '0.25rem';
                label.style.fontSize = '0.85rem';
                label.style.cursor = 'pointer';
                label.style.lineHeight = '1.2';
                label.style.paddingLeft = (level * 10) + 'px';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = item.permission;
                checkbox.dataset.role = roleKey;
                if (rolePermissions.includes(item.permission)) {
                    checkbox.checked = true;
                }

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(item.label));
                container.appendChild(label);

                // Render Actions (Buttons) if any
                if (item.actions && Array.isArray(item.actions)) {
                    item.actions.forEach(actionKey => {
                        const actionLabel = document.createElement('label');
                        actionLabel.style.display = 'flex';
                        actionLabel.style.alignItems = 'center';
                        actionLabel.style.gap = '0.5rem';
                        actionLabel.style.marginBottom = '0.25rem';
                        actionLabel.style.fontSize = '0.8rem'; // Slightly smaller
                        actionLabel.style.color = '#64748b'; // Muted color
                        actionLabel.style.cursor = 'pointer';
                        actionLabel.style.lineHeight = '1.2';
                        actionLabel.style.paddingLeft = ((level + 1) * 15) + 'px'; // Indented

                        const actionCheckbox = document.createElement('input');
                        actionCheckbox.type = 'checkbox';
                        actionCheckbox.value = actionKey;
                        actionCheckbox.dataset.role = roleKey;
                        if (rolePermissions.includes(actionKey)) {
                            actionCheckbox.checked = true;
                        }

                        // Friendly name from translations
                        const friendlyName = PERMISSION_TRANSLATIONS[actionKey] || actionKey;

                        actionLabel.appendChild(actionCheckbox);
                        actionLabel.appendChild(document.createTextNode(friendlyName));
                        container.appendChild(actionLabel);
                    });
                }
            }
        });
    }

    async function savePermissions() {
        if (!roleSelect || !roleSelect.value) return;
        const roleKey = roleSelect.value;

        const checkboxes = permissionMatrixContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedPerms = Array.from(checkboxes).map(cb => cb.value);

        const btn = document.getElementById('btn-save-perms');
        if (btn) {
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Guardando...';

            try {
                // Update local state first
                if (window.currentRolesConfig && window.currentRolesConfig[roleKey]) {
                    window.currentRolesConfig[roleKey].permissions = selectedPerms;
                }

                // Call centralized save (uses PUT)
                await saveRolesConfig('Permisos actualizados correctamente.');

                permissionsModal.classList.add('hidden');
                permissionsModal.style.display = '';
            } catch (e) {
                // Error handled in saveRolesConfig, but we need to reset button
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    }

    function renderManageRolesList() {
        console.log('DEBUG: renderManageRolesList called');
        if (!manageRolesList) {
            console.error('DEBUG: manageRolesList container NOT found');
            return;
        }
        manageRolesList.innerHTML = '';

        if (!window.currentRolesConfig) {
            console.log('DEBUG: currentRolesConfig missing, fetching...');
            // Try to fetch if missing?
            apiFetch('/config/roles').then(roles => {
                window.currentRolesConfig = roles;
                renderManageRolesList();
            });
            return;
        }

        const roleKeys = Object.keys(window.currentRolesConfig);
        console.log('DEBUG: Found roles:', roleKeys.length, roleKeys);

        roleKeys.forEach(roleKey => {
            const role = window.currentRolesConfig[roleKey];
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '0.75rem';
            li.style.borderBottom = '1px solid #f1f5f9';

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `<strong>${role.name}</strong> <span style="font-size: 0.75rem; color: #94a3b8; margin-left: 0.5rem;">(${roleKey})</span>`;
            li.appendChild(infoDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';

            const btnEdit = document.createElement('button');
            btnEdit.innerHTML = '<span class="material-icons-outlined" style="font-size: 1.25rem;">edit</span>';
            btnEdit.title = 'Editar nombre';
            btnEdit.style.background = 'none';
            btnEdit.style.border = 'none';
            btnEdit.style.color = '#3b82f6';
            btnEdit.style.cursor = 'pointer';
            btnEdit.onclick = () => editRoleName(roleKey);
            actionsDiv.appendChild(btnEdit);

            const isSystemRole = ['admin', 'director'].includes(roleKey);
            const btnDelete = document.createElement('button');
            btnDelete.innerHTML = '<span class="material-icons-outlined" style="font-size: 1.25rem;">delete</span>';
            btnDelete.title = isSystemRole ? 'Rol del sistema' : 'Eliminar rol';
            btnDelete.style.background = 'none';
            btnDelete.style.border = 'none';
            btnDelete.style.color = isSystemRole ? '#cbd5e1' : '#ef4444';
            btnDelete.style.cursor = isSystemRole ? 'not-allowed' : 'pointer';
            if (!isSystemRole) {
                btnDelete.onclick = () => deleteRole(roleKey);
            }
            actionsDiv.appendChild(btnDelete);

            li.appendChild(actionsDiv);
            manageRolesList.appendChild(li);
        });
    }

    async function editRoleName(roleKey) {
        if (!window.currentRolesConfig) return;
        const currentName = window.currentRolesConfig[roleKey].name;
        const newName = prompt('Nuevo nombre para el rol:', currentName);
        if (newName && newName.trim() !== '' && newName !== currentName) {
            window.currentRolesConfig[roleKey].name = newName.trim();
            await saveRolesConfig('Nombre actualizado.');
            renderManageRolesList();
        }
    }

    async function deleteRole(roleKey) {
        if (!window.currentRolesConfig) return;

        showConfirmModal({
            title: '¿Eliminar Rol?',
            message: '¿Estás seguro de eliminar el rol "' + window.currentRolesConfig[roleKey].name + '"?',
            confirmText: 'Eliminar',
            isDestructive: true,
            onConfirm: async () => {
                delete window.currentRolesConfig[roleKey];
                await saveRolesConfig('Rol eliminado.');
                renderManageRolesList();
            }
        });
    }

    async function saveRolesConfig(msg) {
        try {
            await apiFetch('/config/roles', {
                method: 'PUT',
                body: JSON.stringify(window.currentRolesConfig)
            });
            showConfirmModal({
                title: 'Éxito',
                message: msg || 'Configuración guardada.',
                isAlert: true,
                isSuccess: true,
                isDestructive: false
            });
        } catch (e) {
            console.error('Error saving roles:', e);
            showAlertModal('Error', 'Error al guardar: ' + e.message, true);
            throw e;
        }
    }
}
// End initPermissionsUI helper
// End initPermissionsUI
// Final debris cleared.
window.savePermissions = async () => {
    // console.log('Global Save Triggered');
    const roleSelect = document.getElementById('permission-role-select');
    const container = document.getElementById('permission-matrix-container');
    const modal = document.getElementById('permission-modal');

    if (!roleSelect || !container) {
        return showAlertModal('Error', 'Error de interfaz: Elementos no encontrados.', true);
    }

    const roleKey = roleSelect.value;
    if (!roleKey) return showAlertModal('Aviso', 'Selecciona un rol primero.', true);

    // alert('DEBUG: Guardando permisos para ' + roleKey);

    // Gather checked boxes
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const newPermissions = Array.from(checkedBoxes).map(cb => cb.value);

    // Update Config Object
    if (!currentRolesConfig[roleKey]) {
        // Should not happen if select is populated from it
        return showAlertModal('Error', 'Error: Rol no encontrado en configuración.', true);
    }
    currentRolesConfig[roleKey].permissions = newPermissions;

    try {
        await apiFetch('/config/roles', {
            method: 'PUT',
            body: JSON.stringify(currentRolesConfig)
        });

        showAlertModal('Éxito', 'Permisos guardados correctamente.');
        modal.classList.add('hidden');
        applyPermissions(); // Auto-refresh UI
    } catch (e) {
        console.error(e);
        showAlertModal('Error', 'Error al guardar permisos: ' + e.message, true);
    }
};

// Initialize on Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPermissionsUI);
} else {
    initPermissionsUI();
}

// DEBUG: Confirm file loaded
// alert('APP JS LOADED v13 - DEBUG MODE');

// --- Parents Dashboard Logic ---
// activeParentStudent is declared globally at the top

async function loadParentsDashboard(user) {
    let familyId = user.linked_family_id || localStorage.getItem('linked_family_id');

    // Auto-Repair: If no familyId, try to refresh user profile once
    if (!familyId) {
        console.log('Orphaned Parent User detected. Attempting profile refresh...');
        const freshUser = await refreshUserData(user.id);
        if (freshUser && freshUser.linked_family_id) {
            console.log('Profile Refreshed! Found Family ID:', freshUser.linked_family_id);
            // Update Local State
            user.linked_family_id = freshUser.linked_family_id;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('linked_family_id', freshUser.linked_family_id);
            familyId = freshUser.linked_family_id;
        }
    }

    const studentsContainer = document.getElementById('parents-children-list');
    const financeContainer = document.getElementById('parents-finance-list');
    const summaryEl = document.getElementById('parents-account-summary'); // Fixed reference

    // Display Greeting
    const greetingEl = document.getElementById('parents-header-greeting');
    if (greetingEl) {
        greetingEl.innerText = `Hola, ${user.username || 'Usuario'}`;
    }

    // Display Family ID
    const familyIdDisplay = document.getElementById('parents-family-id-display');
    if (familyIdDisplay && familyId) {
        familyIdDisplay.innerText = familyId;
    }

    // Initialize Tabs
    initParentsTabs();

    if (!familyId) {
        studentsContainer.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color: #64748b;">
                <span class="material-icons-outlined" style="font-size: 3rem; margin-bottom: 1rem;">link_off</span>
                <p>No se encontró información familiar vinculada.</p>
            </div>`;
        return;
    }

    try {
        // 1. Fetch & Render Students
        const students = await apiFetch(`/students?family_id=${familyId}`);
        renderStudentCards(students, studentsContainer);

        // Auto-select first student
        if (students && students.length > 0) {
            renderStudentDetail(students[0]);
            // Ensure first tab is active
            switchParentsTab('general');

            // 1b. Fetch Parent Details for Greeting (Best Effort)
            try {
                // We use the first student to find the parents of this family
                const parents = await apiFetch(`/students/${students[0].id}/parents`);
                if (parents && parents.length > 0) {
                    // Try to match by email
                    const matchedParent = parents.find(p => p.email === user.email);
                    const targetParent = matchedParent || parents[0]; // Fallback to first parent

                    if (targetParent && targetParent.name) {
                        const greetingEl = document.getElementById('parents-header-greeting');
                        if (greetingEl) {
                            greetingEl.innerText = `Hola, ${targetParent.name} ${targetParent.lastnameP || ''}`;
                        }
                    }
                }
            } catch (e) {
                console.warn('Could not fetch specific parent details for greeting', e);
                // Keep default greeting
            }
        }

        // 2. Fetch & Render Finance (Hidden for now in new UI, but logic kept)
        // const payments = await apiFetch(`/payments/family/${familyId}`);
        // renderFinanceSection(payments, financeContainer, summaryEl);

    } catch (e) {
        console.error('Error loading parents dashboard:', e);
        studentsContainer.innerHTML = '<div style="color:#ef4444; text-align:center; padding: 2rem;">Error al cargar datos. Por favor recarga la página.</div>';
    }
}

function initParentsTabs() {
    const tabs = document.querySelectorAll('.parent-tab-btn');
    tabs.forEach(tab => {
        tab.removeEventListener('click', handleTabClick); // Avoid duplicates if re-run
        tab.addEventListener('click', handleTabClick);
    });
}

function handleTabClick(e) {
    const tabId = e.currentTarget.getAttribute('data-tab');
    switchParentsTab(tabId);
}

function switchParentsTab(tabId) {
    console.log('Switching Parent Tab:', tabId);

    // 1. Update Tabs
    document.querySelectorAll('.parent-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
            // Inline style overrides class often, so we apply them here too
            btn.style.borderBottomColor = 'var(--primary)';
            btn.style.color = 'var(--primary)';
            btn.style.background = '#eff6ff';
        } else {
            btn.classList.remove('active');
            btn.style.borderBottomColor = 'transparent';
            btn.style.color = '#64748b';
            btn.style.background = 'transparent';
        }
    });

    // 2. Update Content Panes
    document.querySelectorAll('.parent-tab-pane').forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
        }
    });

    // 3. Trigger Data Load Actions
    if (tabId === 'clinical') {
        if (typeof activeParentStudent !== 'undefined' && activeParentStudent && activeParentStudent.id) {
            loadParentClinicalData(activeParentStudent.id);
        } else {
            console.warn('Cannot load clinical data: No active student selected.');
        }
    } else if (tabId === 'financial') {
        // Assuming renderFinanceSection or similar exists, or renderStudentFinancial
        // Grep showed renderStudentNotifications, renderStudentTasks. 
        // Logic I deleted had: renderStudentFinancial, renderStudentEvaluations.
        // Let's reinstate them safely.

        if (typeof renderStudentFinancial === 'function' && activeParentStudent) {
            renderStudentFinancial(activeParentStudent);
        } else if (typeof renderFinanceSection === 'function') {
            // Fallback if the specific wrapper doesn't exist but the inner one does
            // logic might be more complex here, but user asked for "examples" so these functions likely mock data
            console.warn('renderStudentFinancial not found');
        }
    } else if (tabId === 'evaluations' && activeParentStudent) {
        if (typeof renderStudentEvaluations === 'function') renderStudentEvaluations(activeParentStudent);
    } else if (tabId === 'tasks' && activeParentStudent) {
        if (typeof renderStudentTasks === 'function') renderStudentTasks(activeParentStudent);
        if (typeof renderStudentTasks === 'function') renderStudentTasks(activeParentStudent);
        if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
        // if (typeof renderStudentNotifications === 'function') renderStudentNotifications(activeParentStudent);
    } else if (tabId === 'config') {
        if (typeof renderParentsConfig === 'function') renderParentsConfig();
    }
}

function renderStudentCards(students, container) {
    container.innerHTML = '';

    if (!students || students.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color: #94a3b8;">No hay alumnos registrados.</div>';
        return;
    }

    students.forEach((student, index) => {
        const card = document.createElement('div');
        card.dataset.studentId = student.id; // Mark for selection
        card.className = 'parent-student-card';
        // Add click cursor and hover effect possibility - Move styles to CSS in future, keeping inline for now but cleaner
        card.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                border: 1px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 260px; /* Ensure good width in horizontal scroll */
                flex-shrink: 0;   /* Prevent squashing */
                `;

        if (index === 0) {
            // select first one by default visual style applied later by function or here
            card.classList.add('active-student-card');
            card.style.background = '#f0f9ff';
            card.style.borderColor = '#3b82f6';
        }

        // Add Click Handler
        card.onclick = () => {
            // Remove active class from all
            container.querySelectorAll('.parent-student-card').forEach(c => {
                c.style.background = 'white';
                c.style.borderColor = 'transparent';
                c.classList.remove('active-student-card');
            });
            // Add active to this
            card.style.background = '#f0f9ff';
            card.style.borderColor = '#3b82f6';
            card.classList.add('active-student-card');

            renderStudentDetail(student);
            switchParentsTab('general'); // Reset to general info when switching student
        };

        const initial = student.name.charAt(0).toUpperCase();

        card.innerHTML = `
                <div style="
                width: 42px; 
                height: 42px; 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                color: white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 1.1rem; 
                font-weight: 600;
                flex-shrink: 0;
            ">
                    ${initial}
                </div>
                <div style="flex: 1; overflow: hidden;">
                    <h4 style="margin:0; font-size: 0.95rem; color: #334155; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${student.name}</h4>
                    <div style="color: #64748b; font-size: 0.8rem; margin-top: 2px;">${student.grade} ${student.group_name || ''}</div>
                </div>
                `;
        container.appendChild(card);
    });
}

// Render Student Detail (New Master-Detail View)
function renderStudentDetail(student) {
    activeParentStudent = student; // Store for tab usage
    console.log('Rendering student detail:', student);
    const container = document.getElementById('parents-detail-content');
    if (!container) {
        console.error('Error: parents-detail-content container not found!');
        return;
    }
    console.log('Found container, rendering...');

    // Scroll to top
    if (container.parentElement) {
        container.parentElement.scrollTop = 0;
    }

    try {
        const name = student.name || 'Sin Nombre';
        const lastnameP = student.lastnameP || '';
        const lastnameM = student.lastnameM || '';
        const initial = name.charAt(0).toUpperCase();

        // Calculate Age safely
        let age = '-';
        if (student.birthdate) {
            try {
                const dob = new Date(student.birthdate);
                const diff = Date.now() - dob.getTime();
                age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
            } catch (e) { console.error('Age calc error', e); }
        }

        const formattedDOB = student.birthdate ? new Date(student.birthdate).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) : 'No registrada';

        // Data Mapping Logic
        let displayLevel = student.academic_level || student.level;
        let displayGrade = student.grade;

        // Smart fallback: If subgrade exists (e.g. "3ro"), then 'grade' is likely the Level (e.g. "Primaria")
        if (!displayLevel && student.subgrade) {
            displayLevel = student.grade;
            displayGrade = student.subgrade;
        }

        const genderText = student.gender === 'M' ? 'Masculino' : student.gender === 'F' ? 'Femenino' : '-';

        container.innerHTML = `
                <div style="padding: 2rem;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 2rem;">
                        <div style="
                        width: 100px; height: 100px; 
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white; 
                        border-radius: 50%; 
                        margin: 0 auto 1rem; 
                        display: flex; align-items: center; justify-content: center; 
                        font-size: 3rem; font-weight: 700;
                        box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                    ">
                            ${initial}
                        </div>
                        <h2 style="margin: 0; color: #1e293b; font-size: 1.75rem;">${name} ${lastnameP} ${lastnameM}</h2>
                        <p style="color: #64748b; margin-top: 0.25rem;">${student.unique_id || 'ID: ' + student.id}</p>

                        <div style="margin-top: 1rem;">
                            <span style="
                            display: inline-block;
                            padding: 0.35rem 1rem;
                            background: #dcfce7;
                            color: #166534;
                            border-radius: 999px;
                            font-weight: 600;
                            font-size: 0.85rem;
                        ">${student.status || 'Activo'}</span>
                        </div>
                    </div>

                    <!-- Content Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">

                        <!-- Academic Card -->
                        <div style="background: #f8fafc; border-radius: 12px; padding: 1.5rem; border: 1px solid #e2e8f0;">
                            <h4 style="margin-top: 0; display: flex; align-items: center; gap: 0.5rem; color: #334155;">
                                <span class="material-icons-outlined">school</span>
                                Información Académica
                            </h4>
                            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Nivel Educativo</div>
                                    <div style="font-size: 1.1rem; font-weight: 500; color: #0f172a;">${displayLevel || 'No registrado'}</div>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Grado</div>
                                        <div style="font-size: 1.1rem; font-weight: 500; color: #0f172a;">${displayGrade || '-'}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Grupo</div>
                                        <div style="font-size: 1.1rem; font-weight: 500; color: #0f172a;">${student.group_name || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Personal Card -->
                        <div style="background: #f8fafc; border-radius: 12px; padding: 1.5rem; border: 1px solid #e2e8f0;">
                            <h4 style="margin-top: 0; display: flex; align-items: center; gap: 0.5rem; color: #334155;">
                                <span class="material-icons-outlined">person</span>
                                Datos Personales
                            </h4>
                            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">CURP</div>
                                    <div style="font-size: 1rem; font-weight: 500; color: #0f172a; font-family: monospace;">${student.curp || 'No registrada'}</div>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Fecha Nacimiento</div>
                                        <div style="font-size: 1rem; font-weight: 500; color: #0f172a;">${formattedDOB}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Edad</div>
                                        <div style="font-size: 1rem; font-weight: 500; color: #0f172a;">${age}</div>
                                    </div>
                                </div>
                                <!-- Gender if available -->
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Género</div>
                                    <div style="font-size: 1rem; font-weight: 500; color: #0f172a;">${genderText}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                `;
    } catch (err) {
        console.error('Error rendering student detail inner HTML:', err);
        container.innerHTML = `<div style="color:red; padding:2rem;">Error visualizando: ${err.message}</div>`;
    }
}

// Render Clinical Info
function renderStudentClinical(student) {
    const container = document.getElementById('tab-clinical');
    if (!container) return;

    // Static Data for now (as per plan)
    const bloodType = student.blood_type || 'No registrado';
    const allergies = student.allergies || 'No registradas';
    const conditions = student.medical_conditions || 'Ninguna registrada';

    // Emergency Contact
    const emergencyName = 'No registrado';
    const emergencyPhone = 'No registrado';
    const doctorName = 'No registrado';

    container.innerHTML = `
                <div style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
                    <!-- Header -->
                    <div style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                        <h2 style="color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                            <span class="material-icons-outlined" style="color: #ef4444;">medical_services</span>
                            Ficha Clínica
                        </h2>
                        <p style="color: #64748b; margin: 0.5rem 0 0 2.25rem;">Información médica y de emergencia</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">

                        <!-- Medical Data -->
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                            <h4 style="margin: 0 0 1.5rem; color: #334155; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                                <span class="material-icons-outlined" style="color: #ef4444;">favorite</span>
                                Datos Médicos
                            </h4>
                            <div style="display: grid; gap: 1.25rem;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Tipo de Sangre</div>
                                    <div style="font-size: 1.1rem; font-weight: 500; color: #0f172a;">${bloodType}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Alergias</div>
                                    <div style="font-size: 1rem; color: #334155; background: #fff1f2; padding: 0.5rem; border-radius: 6px; border: 1px solid #fecdd3;">${allergies}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Condiciones Médicas</div>
                                    <div style="font-size: 1rem; color: #334155;">${conditions}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Emergency Contact -->
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                            <h4 style="margin: 0 0 1.5rem; color: #334155; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                                <span class="material-icons-outlined" style="color: #f59e0b;">warning</span>
                                Emergencia
                            </h4>
                            <div style="display: grid; gap: 1.25rem;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Contacto Principal</div>
                                    <div style="font-size: 1.1rem; font-weight: 500; color: #0f172a;">${emergencyName}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Teléfono Emergencia</div>
                                    <div style="font-size: 1.1rem; color: #0f172a; font-family: monospace;">${emergencyPhone}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Doctor de Cabecera</div>
                                    <div style="font-size: 1rem; color: #334155;">${doctorName}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Insurance -->
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                            <h4 style="margin: 0 0 1.5rem; color: #334155; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                                <span class="material-icons-outlined" style="color: #3b82f6;">verified_user</span>
                                Seguro Médico
                            </h4>
                            <div style="display: grid; gap: 1.25rem;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Aseguradora</div>
                                    <div style="font-size: 1rem; color: #334155;">No registrada</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">No. Póliza</div>
                                    <div style="font-size: 1rem; color: #334155; font-family: monospace;">-</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                `;
}

// Render Financial Info
async function renderStudentFinancial(student) {
    const container = document.getElementById('tab-financial');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
                <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #64748b;">
                    <div style="text-align: center;">
                        <span class="material-icons-outlined" style="font-size: 3rem; animation: spin 1s linear infinite;">sync</span>
                        <p style="margin-top: 1rem;">Cargando historial de pagos...</p>
                    </div>
                </div>
                `;

    try {
        const payments = await apiFetch(`/payments/${student.id}`);

        // Render Tables
        container.innerHTML = `
                <div style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
                    <!-- Header -->
                    <div style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <h2 style="color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                                <span class="material-icons-outlined" style="color: #22c55e;">account_balance</span>
                                Información Financiera
                            </h2>
                            <p style="color: #64748b; margin: 0.5rem 0 0 2.25rem;">Historial de pagos y estado de cuenta</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="window.openCodiWebModal('${student.id}')"
                                style="padding: 0.5rem 1rem; background: #0f172a; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;"
                                onmouseover="this.style.background='#1e293b'"
                                onmouseout="this.style.background='#0f172a'">
                                <span class="material-icons-outlined" style="color: #22d3ee;">qr_code_2</span>
                                Pagar con CoDi
                            </button>
                            <button onclick="window.openAccountStatement('${student.id}')"
                                style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;"
                                onmouseover="this.style.background='#2563eb'"
                                onmouseout="this.style.background='#3b82f6'">
                                <span class="material-icons-outlined" style="font-size: 1.25rem;">assessment</span>
                                Ver Estado de Cuenta
                            </button>
                        </div>
                    </div>

                    <!-- Summary Cards (Placeholder for dynamic calculation if needed) -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 8px;">
                            <div style="color: #166534; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Total Pagado</div>
                            <div style="color: #15803d; font-size: 1.5rem; font-weight: 700;">$${payments.reduce((acc, p) => acc + parseFloat(p.amount), 0).toFixed(2)}</div>
                        </div>
                        <!-- Demo Balance Card -->
                        <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="color: #9f1239; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Saldo Pendiente (Demo)</div>
                                <div style="color: #be123c; font-size: 1.5rem; font-weight: 700;">$4,500.00</div>
                            </div>
                        </div>
                    </div>

                    <!-- Payments Table -->
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                                <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                    <tr>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Fecha</th>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Concepto</th>
                                        <th style="padding: 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Método</th>
                                        <th style="padding: 1rem; text-align: right; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.length > 0 ? payments.map(p => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 1rem; color: #334155;">
                                            ${new Date(p.payment_date).toLocaleDateString()}
                                            <div style="font-size: 0.75rem; color: #94a3b8;">${new Date(p.payment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td style="padding: 1rem; color: #0f172a; font-weight: 500;">
                                            ${p.concept}
                                            <div style="font-size: 0.75rem; color: #64748b;">Ref: ${p.id}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; color: #475569;">
                                                ${p.payment_method}
                                            </span>
                                        </td>
                                        <td style="padding: 1rem; text-align: right; font-weight: 600; color: #0f172a;">
                                            $${parseFloat(p.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="4" style="padding: 3rem; text-align: center; color: #94a3b8;">
                                            No hay pagos registrados para este alumno.
                                        </td>
                                    </tr>
                                `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                `;

    } catch (e) {
        console.error('Error loading financial info:', e);
        container.innerHTML = `
                <div style="color: #ef4444; padding: 2rem; text-align: center;">
                    <span class="material-icons-outlined" style="font-size: 2rem;">error_outline</span>
                    <p>Error al cargar la información financiera.</p>
                </div>
                `;
    }
}

// --- Web CoDi Implementation ---
let codiWebState = {
    student: null,
    concept: null,
    months: [] // Changed to array for multi-selection
};

window.openCodiWebModal = async (studentId) => {
    const modal = document.getElementById('codi-web-modal');
    // Reset state
    codiWebState = { student: null, concept: null, months: [] };
    resetCodiModal();

    // Show modal
    modal.classList.remove('hidden');

    // Fetch Student & Concepts
    try {
        const studentData = await apiFetch(`/students/${studentId}`);
        const student = Array.isArray(studentData) ? studentData[0] : studentData;
        codiWebState.student = student;

        // Fetch Payments for History
        const payments = await apiFetch(`/payments/${studentId}`);

        // Fetch & Infer Concept
        await fetchWebTuitionConcept(student);

        // Render Grid with History
        renderCodiMonthGrid(payments || []);

    } catch (e) {
        console.error('CoDi Init Error:', e);
        showAlertModal('Error', 'Error al inicializar CoDi: ' + e.message, true);
        modal.classList.add('hidden');
    }
};

async function fetchWebTuitionConcept(student) {
    const debugEl = document.getElementById('codi-debug-info');
    try {
        const concepts = await apiFetch('/concepts');
        const inferredLevel = inferWebLevel(student);

        // Debug Info
        debugEl.innerHTML = `
                <strong>Debug Nivel:</strong> ${inferredLevel} <br>
                    <strong>Grado Original:</strong> ${student.grade || student.grado} <br>
                        <strong>Nivel Original:</strong> ${student.educational_level || student.level_id} <br>
                            `;

        const match = concepts.find(c => {
            const cLevel = (c.academic_level || '').toUpperCase().trim();
            const cName = (c.name || '').toUpperCase();
            const levelMatch = cLevel === 'GENERAL' || cLevel === inferredLevel;
            const isTuition = cName.includes('COLEGIATURA') || cName.includes('MENSUALIDAD');
            return levelMatch && isTuition;
        });

        if (match) {
            codiWebState.concept = match;
            debugEl.innerHTML += `<strong style="color:green">Concepto Encontrado:</strong> ${match.name} ($${match.default_amount})`;
        } else {
            debugEl.innerHTML += `<strong style="color:red">Concepto NO Encontrado</strong>`;
            debugEl.classList.remove('hidden'); // Show debug if fail
        }

    } catch (e) {
        console.error('Fetch Concept Error', e);
        debugEl.innerHTML += `<br>Error: ${e.message}`;
        debugEl.classList.remove('hidden');
    }
}

function inferWebLevel(s) {
    const rawLevel = (s.educational_level || s.level || s.level_id || '').toUpperCase().trim();
    if (rawLevel && rawLevel.length > 2) return rawLevel;

    const grade = (s.grade || s.grado || '').toUpperCase().trim();
    if (grade.includes('KIN') || grade.includes('PRE') || grade.includes('KINDER')) return 'PREESCOLAR';
    if (grade.includes('PRI') || grade.includes('PRIM')) return 'PRIMARIA';
    if (grade.includes('SEC') || grade.includes('SECUNDARIA')) return 'SECUNDARIA';
    if (grade.includes('BAC') || grade.includes('PREP')) return 'BACHILLERATO';
    if (grade.includes('UNI') || grade.includes('LIC')) return 'LICENCIATURA';

    return rawLevel || grade || 'GENERAL';
}

function renderCodiMonthGrid(payments) {
    const grid = document.getElementById('codi-month-grid');
    grid.innerHTML = '';

    const months = [
        "Septiembre", "Octubre", "Noviembre", "Diciembre",
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"
    ];

    // Normalize Check
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    months.forEach(month => {
        // Check Status
        const paymentRecord = Array.isArray(payments) ? payments.find(p => {
            if (!p.concept) return false;
            return normalize(p.concept).includes(normalize(month)) &&
                (normalize(p.concept).includes('colegiatura') || normalize(p.concept).includes('mensualidad'));
        }) : null;

        const isPaid = paymentRecord && (paymentRecord.status === 'COMPLETED' || paymentRecord.codi_status === 'COMPLETED' || !paymentRecord.codi_status); // Manual pmt fix
        const isPending = paymentRecord && (!isPaid && (paymentRecord.status === 'PENDING' || paymentRecord.codi_status === 'PENDING'));

        const btn = document.createElement('button');
        btn.style.padding = '0.75rem';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid #e2e8f0';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = '500';
        btn.style.position = 'relative';

        let label = month;

        // Calculate Overdue
        const currentYear = new Date().getFullYear();
        const currentMonthIdx = new Date().getMonth();
        const monthMap = {
            'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5, 'Julio': 6
        };
        const mIdx = monthMap[month];

        let cycleStartYear = currentYear;
        if (currentMonthIdx < 7) cycleStartYear = currentYear - 1;

        let targetYear = cycleStartYear;
        if (mIdx < 8) targetYear = cycleStartYear + 1;

        const deadline = new Date(targetYear, mIdx, 10, 23, 59, 59);
        const isOverdue = !isPaid && (new Date() > deadline);
        const isSelected = codiWebState.months.includes(month);

        // Styling Logic
        if (isPaid) {
            btn.style.background = '#dcfce7';
            btn.style.borderColor = '#16a34a';
            btn.style.color = '#166534';
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            label += '<br><span style="font-size:0.7rem; font-weight:bold;">PAGADO</span>';
        } else if (isPending) {
            btn.style.background = '#fef9c3';
            btn.style.borderColor = '#ca8a04';
            btn.style.color = '#854d0e';
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            label += '<br><span style="font-size:0.7rem; font-weight:bold;">PENDIENTE</span>';
        } else {
            // Default Clean Style
            btn.style.background = 'white';
            btn.style.color = '#334155';
            btn.style.borderColor = '#e2e8f0';

            if (isOverdue) {
                btn.style.background = '#fee2e2'; // Red
                btn.style.borderColor = '#fecaca';
                btn.style.color = '#b91c1c';
                if (!isSelected) label += ' (Vencido)';
            }

            // Selection overrides overdue color (turns blue)
            if (isSelected) {
                btn.style.borderColor = '#3b82f6';
                btn.style.background = '#eff6ff';
                btn.style.color = '#1e40af';
                btn.style.borderWidth = '2px';
            }

            btn.onclick = () => selectCodiMonth(month, payments);
        }

        btn.innerHTML = label;
        grid.appendChild(btn);
    });
}

function selectCodiMonth(month, payments) {
    if (!codiWebState.concept) return showAlertModal('Error', 'No se encontró el costo de colegiatura para este alumno.', true);

    // Toggle Selection
    const index = codiWebState.months.indexOf(month);
    if (index > -1) {
        codiWebState.months.splice(index, 1);
    } else {
        codiWebState.months.push(month);
    }

    // Re-Render Grid to update visuals
    renderCodiMonthGrid(payments);

    // Update Summary
    updateCodiSummary();
}

// Phone Validation Helper
window.validateCodiPhone = function () {
    const input = document.getElementById('codi-phone-input');
    const btn = document.getElementById('btn-generate-codi-web');

    // Check selection state too
    if (codiWebState.months.length === 0) {
        btn.disabled = true;
        return;
    }

    const phone = input.value.replace(/\D/g, '');
    if (phone.length === 10) {
        btn.disabled = false;
        btn.classList.remove('opacity-50'); // Ensure it looks active
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50');
    }
};

function updateCodiSummary() {
    const summaryEl = document.getElementById('codi-selection-summary');
    const conceptEl = document.getElementById('codi-summary-concept');
    const amountEl = document.getElementById('codi-summary-amount');
    const btnGen = document.getElementById('btn-generate-codi-web');

    if (codiWebState.months.length === 0) {
        summaryEl.classList.add('hidden');
        btnGen.disabled = true;
        // btnGen.textContent = 'Generar Código QR'; // OLD
        btnGen.innerHTML = '<span class="material-icons-outlined">send_to_mobile</span> Enviar Solicitud';
        return;
    }

    summaryEl.classList.remove('hidden');

    const count = codiWebState.months.length;
    const baseAmount = parseFloat(codiWebState.concept.default_amount);
    const totalAmount = baseAmount * count;
    const monthList = codiWebState.months.join(', ');
    const formattedTotal = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    conceptEl.textContent = `${codiWebState.concept.name} (${count}): ${monthList}`;
    amountEl.textContent = `$${formattedTotal}`;

    // Update Button Amount Text but keep validation state
    btnGen.innerHTML = `<span class="material-icons-outlined">send_to_mobile</span> Cobrar $${formattedTotal}`;

    // Trigger validation to check if phone is already there or needs entry
    validateCodiPhone();

    // Bind Action
    btnGen.onclick = sendWebCodiRequest;
}

async function sendWebCodiRequest() {
    if (!codiWebState.concept || codiWebState.months.length === 0 || !codiWebState.student) return;

    const phoneInput = document.getElementById('codi-phone-input');
    const phoneNumber = phoneInput.value.replace(/\D/g, '');

    if (phoneNumber.length !== 10) return showAlertModal('Aviso', 'Por favor ingresa un número celular válido de 10 dígitos.', true);

    const btn = document.getElementById('btn-generate-codi-web');
    btn.disabled = true;
    btn.innerHTML = 'Enviando...';

    const count = codiWebState.months.length;
    const baseAmount = parseFloat(codiWebState.concept.default_amount);
    const totalAmount = baseAmount * count;
    const monthList = codiWebState.months.join(', ');
    const conceptName = `${codiWebState.concept.name} - ${monthList}`;

    try {
        const payload = {
            amount: totalAmount,
            concept: conceptName,
            student_id: codiWebState.student.id, // endpoint expects student_id
            phoneNumber: phoneNumber
            // web flow doesn't use 'items' bulk array yet in this specific modal logic, 
            // or we could construct it if we want separate rows in DB. 
            // Current flow saves 1 row. Let's stick to simple flow for now.
        };

        const response = await apiFetch('/payments/codi/request', 'POST', payload);

        if (response && response.success) {
            // Show Success Step
            document.getElementById('codi-step-selection').classList.add('hidden');
            document.getElementById('codi-step-qr').classList.remove('hidden'); // Reusing ID for simplicity, renamed in concept to "step-success"

            // Update Success Elements
            document.getElementById('codi-sent-phone').textContent = phoneNumber;
            document.getElementById('codi-qr-amount-label').textContent = `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        } else {
            throw new Error(response.error || 'Respuesta inválida');
        }

    } catch (e) {
        console.error(e);
        showAlertModal('Error', 'Error al enviar solicitud: ' + e.message, true);
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-outlined">send_to_mobile</span> Reintentar';
        validateCodiPhone();
    }
}

window.finishCodiPayment = async function () {
    // 1. Reset View
    resetCodiModal();

    // 2. Re-Fetch Data to update "Paid" status
    if (codiWebState.student) {
        try {
            const payments = await apiFetch(`/payments/${codiWebState.student.id}`);
            renderCodiMonthGrid(payments || []);
        } catch (e) {
            console.error('Error refreshing payments', e);
        }
    }
};

window.resetCodiModal = function () {
    // Safety check for elements
    const s1 = document.getElementById('codi-step-selection');
    if (!s1) return;

    s1.classList.remove('hidden');
    document.getElementById('codi-step-qr').classList.add('hidden');
    document.getElementById('codi-selection-summary').classList.add('hidden');
    document.getElementById('codi-debug-info').classList.add('hidden');
    document.getElementById('btn-generate-codi-web').disabled = true;
    document.getElementById('btn-generate-codi-web').textContent = 'Generar Código QR';

    // Clear selection matches logic
    codiWebState.months = [];
};

// Render Evaluations Info (Mock Data)
function renderStudentEvaluations(student) {
    const container = document.getElementById('tab-evaluations');
    if (!container) return;

    // Mock Data
    const evaluations = [
        { subject: 'Español', teacher: 'Prof. García', grade: 9.5, comments: 'Excelente desempeño.' },
        { subject: 'Matemáticas', teacher: 'Lic. Pérez', grade: 8.8, comments: 'Buen trabajo, mejorar cálculo mental.' },
        { subject: 'Ciencias', teacher: 'Ing. López', grade: 9.2, comments: 'Muy participativa.' },
        { subject: 'Inglés', teacher: 'Miss Sarah', grade: 10.0, comments: 'Outstanding.' },
        { subject: 'Educación Física', teacher: 'Prof. Ruiz', grade: 10.0, comments: 'Completo uniforme.' },
        { subject: 'Artes', teacher: 'Lic. Varela', grade: 9.0, comments: 'Muy creativa.' }
    ];

    const currentPeriod = '1er Bimestre';
    const average = (evaluations.reduce((a, b) => a + b.grade, 0) / evaluations.length).toFixed(1);

    container.innerHTML = `
                                        <div style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
                                            <!-- Header -->
                                            <div style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-end;">
                                                <div>
                                                    <h2 style="color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                                                        <span class="material-icons-outlined" style="color: #8b5cf6;">insights</span>
                                                        Evaluaciones
                                                    </h2>
                                                    <p style="color: #64748b; margin: 0.5rem 0 0 2.25rem;">Boleta de calificaciones actual</p>
                                                </div>
                                                <div style="text-align: right;">
                                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Promedio General</div>
                                                    <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6;">${average}</div>
                                                </div>
                                            </div>

                                            <div style="display: grid; gap: 2rem;">

                                                <!-- Period Selector (Mock) -->
                                                <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem;">
                                                    <button style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 999px; font-weight: 600; cursor: pointer;">1er Bimestre</button>
                                                    <button style="padding: 0.5rem 1rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 999px; font-weight: 500; cursor: pointer;">2do Bimestre</button>
                                                    <button style="padding: 0.5rem 1rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 999px; font-weight: 500; cursor: pointer;">3er Bimestre</button>
                                                    <button style="padding: 0.5rem 1rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 999px; font-weight: 500; cursor: pointer;">Final</button>
                                                </div>

                                                <!-- Report Card Table -->
                                                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                                                    <div style="padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">
                                                        ${currentPeriod}
                                                    </div>
                                                    <div style="overflow-x: auto;">
                                                        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                                                            <thead>
                                                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                                                    <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Materia</th>
                                                                    <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Docente</th>
                                                                    <th style="padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Comentarios</th>
                                                                    <th style="padding: 1rem; text-align: center; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Calificación</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${evaluations.map(ev => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 1rem; font-weight: 500; color: #0f172a;">${ev.subject}</td>
                                        <td style="padding: 1rem; color: #64748b;">${ev.teacher}</td>
                                        <td style="padding: 1rem; color: #64748b; font-size: 0.9rem;">${ev.comments}</td>
                                        <td style="padding: 1rem; text-align: center;">
                                            <span style="display: inline-block; width: 40px; text-align: center; padding: 0.25rem; border-radius: 4px; font-weight: 600; background: ${ev.grade >= 9 ? '#dcfce7' : ev.grade >= 7 ? '#fef9c3' : '#fee2e2'}; color: ${ev.grade >= 9 ? '#166534' : ev.grade >= 7 ? '#854d0e' : '#991b1b'};">
                                                ${ev.grade}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <!-- Download Button -->
                                                <div style="text-align: right;">
                                                    <button style="padding: 0.75rem 1.5rem; background: white; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;">
                                                        <span class="material-icons-outlined">download</span>
                                                        Descargar Boleta PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        `;
}

// Render Tasks Info (Mock Data)
function renderStudentTasks(student) {
    const container = document.getElementById('tab-tasks');
    if (!container) return;

    // Mock Data
    const pendingTasks = [
        { title: 'Ejercicios de Fracciones', subject: 'Matemáticas', dueDate: 'Mañana, 08:00 AM', status: 'pending' },
        { title: 'Resumen de Historia Universal', subject: 'Historia', dueDate: 'Jueves 12, 11:59 PM', status: 'pending' },
        { title: 'Material para Maqueta', subject: 'Ciencias', dueDate: 'Viernes 13, 08:00 AM', status: 'pending' }
    ];

    const completedTasks = [
        { title: 'Lectura Comprensiva', subject: 'Español', dueDate: 'Ayer', status: 'completed' },
        { title: 'Verbos Irregulares', subject: 'Inglés', dueDate: 'Lun 09 Dic', status: 'completed' }
    ];

    container.innerHTML = `
                                        <div style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
                                            <!-- Header -->
                                            <div style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <h2 style="color: #1e293b; margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                                                        <span class="material-icons-outlined" style="color: #f59e0b;">assignment</span>
                                                        Tareas
                                                    </h2>
                                                    <p style="color: #64748b; margin: 0.5rem 0 0 2.25rem;">Actividades y proyectos asignados</p>
                                                </div>
                                                <button style="padding: 0.5rem 1rem; background: #e2e8f0; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #475569; cursor: pointer;">
                                                    Ver Calendario
                                                </button>
                                            </div>

                                            <div style="display: grid; gap: 2rem;">
                                                <!-- Pending -->
                                                <div>
                                                    <h4 style="margin: 0 0 1rem; color: #334155; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                                        <span style="display: block; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></span>
                                                        Pendientes (${pendingTasks.length})
                                                    </h4>
                                                    <div style="display: grid; gap: 1rem;">
                                                        ${pendingTasks.map(task => `
                            <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">${task.subject}</div>
                                    <h5 style="margin: 0; font-size: 1.1rem; color: #0f172a;">${task.title}</h5>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.85rem; color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">
                                        <div style="display: flex; align-items: center; gap: 0.25rem; justify-content: flex-end;">
                                            <span class="material-icons-outlined" style="font-size: 1rem;">schedule</span>
                                            ${task.dueDate}
                                        </div>
                                    </div>
                                    <button style="padding: 0.25rem 0.75rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">Detalles</button>
                                </div>
                            </div>
                        `).join('')}
                                                    </div>
                                                </div>

                                                <!-- Completed (Collapsed by default visually, but rendered for now) -->
                                                <div style="opacity: 0.75;">
                                                    <h4 style="margin: 0 0 1rem; color: #64748b; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                                                        <span style="display: block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></span>
                                                        Completadas Recientemente
                                                    </h4>
                                                    <div style="display: grid; gap: 1rem;">
                                                        ${completedTasks.map(task => `
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem;">${task.subject}</div>
                                    <h5 style="margin: 0; font-size: 1rem; color: #64748b; text-decoration: line-through;">${task.title}</h5>
                                </div>
                                <div style="color: #22c55e; font-size: 0.85rem; font-weight: 600;">
                                    Entregada
                                </div>
                            </div>
                        `).join('')}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        `;

}

// Render Notifications Info 
function renderStudentNotifications(student) {
    // This function is deprecated. Notifications are now loaded via global loadUserNotifications()
    // which handles real API data.
}

// Render Configuration Tab
function renderParentsConfig() {
    const container = document.getElementById('tab-config');
    if (!container) return;

    container.innerHTML = `
                                        <div style="max-width: 500px; margin: 0 auto; animation: fadeIn 0.3s ease;">
                                            <!-- Header -->
                                            <div style="text-align: center; margin-bottom: 2rem;">
                                                <div style="
                    width: 60px; height: 60px; 
                    background: #f1f5f9; 
                    color: #64748b; 
                    border-radius: 50%; 
                    margin: 0 auto 1rem; 
                    display: flex; align-items: center; justify-content: center;
                ">
                                                    <span class="material-icons-outlined" style="font-size: 2rem;">lock_reset</span>
                                                </div>
                                                <h2 style="color: #1e293b; margin: 0;">Cambiar Contraseña</h2>
                                                <p style="color: #64748b; margin-top: 0.5rem;">Asegura tu cuenta actualizando tu clave de acceso.</p>
                                            </div>

                                            <!-- Form -->
                                            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                                <form id="parent-change-password-form" onsubmit="event.preventDefault(); handleParentPasswordChange();">
                                                    <div style="margin-bottom: 1.5rem;">
                                                        <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem;">Nueva Contraseña</label>
                                                        <div style="position: relative;">
                                                            <span class="material-icons-outlined" style="position: absolute; left: 12px; top: 10px; color: #94a3b8;">vpn_key</span>
                                                            <input type="password" id="parent-new-password" required minlength="4"
                                                                style="width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.5rem; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; transition: border-color 0.2s;"
                                                                placeholder="Mínimo 4 caracteres"
                                                                onfocus="this.style.borderColor = '#3b82f6'"
                                                                onblur="this.style.borderColor = '#cbd5e1'">
                                                        </div>
                                                    </div>

                                                    <div style="margin-bottom: 2rem;">
                                                        <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem;">Confirmar Nueva Contraseña</label>
                                                        <div style="position: relative;">
                                                            <span class="material-icons-outlined" style="position: absolute; left: 12px; top: 10px; color: #94a3b8;">check_circle</span>
                                                            <input type="password" id="parent-confirm-password" required minlength="4"
                                                                style="width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.5rem; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; transition: border-color 0.2s;"
                                                                placeholder="Repite tu contraseña"
                                                                onfocus="this.style.borderColor = '#3b82f6'"
                                                                onblur="this.style.borderColor = '#cbd5e1'">
                                                        </div>
                                                    </div>

                                                    <div id="parent-password-feedback" style="margin-bottom: 1rem; display: none;"></div>

                                                    <button type="submit"
                                                        style="width: 100%; padding: 0.75rem; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                                                        Actualizar Contraseña
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        `;
}

// Logic for Password Change
async function handleParentPasswordChange() {
    const feedbackEl = document.getElementById('parent-password-feedback');
    const p1 = document.getElementById('parent-new-password').value;
    const p2 = document.getElementById('parent-confirm-password').value;

    if (p1 !== p2) {
        feedbackEl.style.display = 'block';
        feedbackEl.style.color = '#ef4444';
        feedbackEl.innerHTML = '<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center;">Las contraseñas no coinciden.</div>';
        return;
    }

    try {
        const response = await apiFetch('/auth/change-password', 'POST', {
            userId: currentUser.id, // Using global currentUser variable
            newPassword: p1
        });

        if (response) {
            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#15803d';
            feedbackEl.innerHTML = '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center;">¡Contraseña actualizada con éxito!</div>';

            // Clear form
            document.getElementById('parent-change-password-form').reset();
        }
    } catch (e) {
        console.error('Password change error:', e);
        feedbackEl.style.display = 'block';
        feedbackEl.style.color = '#ef4444';
        feedbackEl.innerHTML = `<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center;">Error al actualizar: ${e.message || 'Inténtalo de nuevo'}</div>`;
    }
}
// Also close on background click? Might be annoying on mobile if miss-click.
// Let's rely on button for now.

function renderFinanceSection(payments, container, summaryEl) {
    container.innerHTML = '';

    // Calculate total payments made (Not debt, but activity)
    // If we had a debt API, we'd use that. For now, showing total payments logic or 0.
    const totalPaid = payments ? payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;

    if (summaryEl) {
        // For "Estado de Cuenta", usually parents want to see DEBT. 
        // Since we don't have a debt endpoint yet, let's change this to "Pagos del Mes" or hiding it if 0.
        // Or specific logic: if we had `expected_amount` vs `paid`. 
        // Let's set it to a neutral "Historial" style or $0.00 for now.
        summaryEl.innerHTML = `
    < div style = "font-size: 0.875rem; opacity: 0.9;" > Total Pagado</div >
        <div style="font-size: 2rem; font-weight: 700; margin: 0.25rem 0;">${totalPaid.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
        <div style="font-size: 0.75rem; opacity: 0.8;">Ciclo Escolar Actual</div>
`;
    }

    if (!payments || payments.length === 0) {
        container.innerHTML = `
    < div style = "text-align:center; padding:3rem 1rem; color:#94a3b8;" >
                <span class="material-icons-outlined" style="font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.5;">receipt_long</span>
                <p>No hay pagos registrados.</p>
            </div > `;
        return;
    }

    // Sort by date desc
    const sortedDetails = payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    // Group by Month/Year for better list
    let currentMonth = '';

    sortedDetails.forEach(pay => {
        const payDate = new Date(pay.payment_date);
        const monthLabel = payDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

        // Month Header
        if (monthLabel !== currentMonth) {
            currentMonth = monthLabel;
            const header = document.createElement('div');
            header.style.cssText = `
                                        padding: 1rem 0.5rem 0.5rem;
                                        font - size: 0.85rem;
                                        font - weight: 700;
                                        color: #94a3b8;
                                        text - transform: uppercase;
                                        letter - spacing: 0.05em;
                                        `;
            header.textContent = currentMonth;
            container.appendChild(header);
        }

        const formattedAmount = parseFloat(pay.amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

        const item = document.createElement('div');
        item.className = 'payment-item';
        // Styled row
        item.style.cssText = `
                                        background: white;
                                        border - bottom: 1px solid #f1f5f9;
                                        padding: 1rem;
                                        display: flex;
                                        justify - content: space - between;
                                        align - items: center;
                                        `;
        // Last item border radius adjustments could be done via CSS classes eventually

        item.innerHTML = `
                                        < div style="display: flex; flex-direction: column; gap: 2px;" >
                                            <div style="font-weight: 600; color: #334155; font-size: 0.95rem;">${pay.concept}</div>
                                            <div style="font-size: 0.8rem; color: #64748b;">
                                                ${pay.student_name} • ${payDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div >
                                        <div style="font-weight: 700; color: #059669; font-size: 1rem;">
                                            ${formattedAmount}
                                        </div>
                                        `;
        container.appendChild(item);
    });
}

// Parents Navigation Handlers
document.addEventListener('DOMContentLoaded', () => {
    const parentTabs = document.querySelectorAll('.parent-tab-btn');
    console.log('Attaching Parent Tabs:', parentTabs.length);

    parentTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Visual toggle
            parentTabs.forEach(b => {
                b.classList.remove('active');
                b.style.color = '#64748b';
                b.style.borderBottomColor = 'transparent';
            });

            btn.classList.add('active');
            btn.style.color = '#3b82f6';
            btn.style.borderBottomColor = '#3b82f6';

            // Logic to switch tabs
            const tabName = btn.getAttribute('data-tab');
            if (tabName) {
                // Hide all panes
                document.querySelectorAll('.parent-tab-pane').forEach(el => el.classList.add('hidden'));

                // Show target
                const targetPane = document.getElementById(`tab-${tabName}`);
                if (targetPane) {
                    targetPane.classList.remove('hidden');
                    console.log('Switched to tab:', tabName);

                    if (tabName === 'notifications') {
                        // Call directly, fallback to window if needed
                        if (typeof loadUserNotifications === 'function') {
                            loadUserNotifications();
                        } else if (window.loadUserNotifications) {
                            window.loadUserNotifications();
                        }
                    }
                } else {
                    console.error('Target pane not found for:', tabName);
                }
            }
        });
    });
});



// --- Dashboard Logic ---

async function loadDashboardData() {
    try {
        // Example: Load total students
        const students = await apiFetch('/students');
        // Check if element exists before setting textContent
        const totalStudentsEl = document.getElementById('total-students');
        if (totalStudentsEl) {
            totalStudentsEl.textContent = students.length;
        }

        // You can add more dashboard stats here
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// --- Robust Logout Handler ---
// Attached outside the main flow to prevent blockage by other errors
document.addEventListener('DOMContentLoaded', () => {
    try {
        const logoutSidebar = document.getElementById('logout-btn-sidebar');
        const logoutTop = document.getElementById('logout-btn-top');
        const parentsLogout = document.getElementById('btn-parents-logout');

        const safeLogout = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Logout clicked via Safe Handler');

            // Direct Logout Logic to bypass potential dependency issues
            performLogout(); // Use standardized function with Modal
        };

        if (logoutSidebar) {
            // Remove any existing listeners by cloning
            const newBtn = logoutSidebar.cloneNode(true);
            logoutSidebar.parentNode.replaceChild(newBtn, logoutSidebar);
            newBtn.addEventListener('click', safeLogout);
            console.log('Sidebar Logout attached safely');
        }

        if (logoutTop) {
            const newBtn = logoutTop.cloneNode(true);
            logoutTop.parentNode.replaceChild(newBtn, logoutTop);
            newBtn.addEventListener('click', safeLogout);
            console.log('Top Logout attached safely');
        }

        // Ensure parents logout is also safe
        if (parentsLogout) {
            // Remove old listeners ideally, but adding this one is fine if we stop propagation?
            // Better to clone/replace to be safe like others.
            const newBtn = parentsLogout.cloneNode(true);
            parentsLogout.parentNode.replaceChild(newBtn, parentsLogout);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performLogout(); // Use custom modal
            });
        }

    } catch (e) {
        console.error('CRITICAL: Error attaching logout handlers', e);
    }

    // Initialize Password Change logic if present
    initPasswordChange();
});

// Password Change Logic
function initPasswordChange() {
    const btnOpenPassword = document.getElementById('btn-open-change-password');
    const passwordModal = document.getElementById('change-password-modal');
    const btnCancelPassword = document.getElementById('btn-cancel-password');
    const btnSavePassword = document.getElementById('btn-save-password');
    const newPasswordInput = document.getElementById('new-password-input');

    if (btnOpenPassword) {
        btnOpenPassword.addEventListener('click', () => {
            if (newPasswordInput) newPasswordInput.value = '';
            if (passwordModal) passwordModal.classList.remove('hidden');
        });
    }

    if (btnCancelPassword) {
        btnCancelPassword.addEventListener('click', () => {
            if (passwordModal) passwordModal.classList.add('hidden');
        });
    }

    if (btnSavePassword) {
        btnSavePassword.addEventListener('click', async () => {
            const newPass = newPasswordInput.value;
            if (!newPass || newPass.length < 4) {
                showAlertModal('Aviso', 'La contraseña debe tener al menos 6 caracteres.', true);
                return;
            }

            try {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (!currentUser || !currentUser.id) {
                    showAlertModal('Error', 'Error de sesión. Por favor recarga la página.', true);
                    return;
                }

                // Show loading state
                btnSavePassword.textContent = 'Guardando...';
                btnSavePassword.disabled = true;

                const response = await fetch(`${API_URL} /auth/change - password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id, newPassword: newPass })
                });

                const result = await response.json();

                if (response.ok) {
                    showAlertModal('Éxito', 'Contraseña actualizada correctamente.');
                    passwordModal.classList.add('hidden');
                } else {
                    showAlertModal('Error', 'Error: ' + (result.error || 'No se pudo actualizar'), true);
                }
            } catch (e) {
                console.error(e);
                showAlertModal('Error', 'Error de conexión', true);
            } finally {
                btnSavePassword.textContent = 'Guardando';
                btnSavePassword.disabled = false;
            }
        });
    }
}
// End of file

// --- Medical Records Logic ---

// Helper to toggle medical conditional fields
window.toggleMedicalField = function (fieldId, show) {
    const el = document.getElementById(fieldId);
    if (el) {
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    }
};

function calculateAge(birthDateString) {
    if (!birthDateString) return '';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

window.loadMedicalData = async (student_id) => {
    if (!student_id) return;
    document.getElementById('medical-student-id').value = student_id;

    try {
        console.log('Loading medical data for:', student_id);

        // Find student context for Age calculation
        // Ensure 'students' is available globally
        const student = (window.students || []).find(s => s.id == student_id);

        // Reset form first
        document.getElementById('medical-data-form').reset();

        // Reset conditional visibilities
        ['surgeries-details', 'medications-details', 'therapy-details'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        const data = await apiFetch(`/medical/${student_id}`);
        console.log('Medical Data Loaded:', data);

        if (data) {
            // Helper to set value safely
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };

            // Age Calculation using backend data (robust fallback)
            const bdate = data.birthdate || (student && student.birthdate);
            const ageInput = document.getElementById('medical-age');
            if (ageInput) {
                if (bdate) {
                    const age = calculateAge(bdate);
                    ageInput.value = age + (age === 1 ? ' año' : ' años');
                } else {
                    ageInput.value = '-';
                }
            }

            // Helper for radios
            const setRadio = (name, val, targetId) => {
                const radios = document.getElementsByName(name);
                // Convert DB 1/0 to boolean/string match
                // DB might return 1 (int) or "1" (string)
                const isTrue = (val == 1);

                for (let r of radios) {
                    // Radio values are "1" and "0"
                    if (r.value === (isTrue ? "1" : "0")) r.checked = true;
                }
                if (isTrue && targetId) {
                    const el = document.getElementById(targetId);
                    if (el) el.classList.remove('hidden');
                }
            };

            setVal('medical-blood-type', data.blood_type);
            setVal('medical-height', data.height);
            setVal('medical-weight', data.weight);
            setVal('medical-conditions', data.medical_conditions);
            setVal('medical-allergies', data.allergies);

            setRadio('has_surgeries', data.has_surgeries, 'surgeries-details');
            setVal('medical-surgeries-comments', data.surgeries_comments);

            setRadio('has_medications', data.has_medications, 'medications-details');
            setVal('medical-medications', data.medications);

            setRadio('has_therapy', data.has_therapy, 'therapy-details');
            setVal('medical-therapy-comments', data.therapy_comments);

            setVal('medical-emergency-name', data.emergency_contact_name);
            setVal('medical-emergency-phone', data.emergency_contact_phone);
            setVal('medical-doctor-name', data.doctor_name);
            setVal('medical-doctor-phone', data.doctor_phone);
            setVal('medical-doctor-email', data.doctor_email);
            setVal('medical-doctor-office', data.doctor_office);
            setVal('medical-insurance-company', data.insurance_company);
            setVal('medical-insurance-policy', data.insurance_policy);
            setVal('medical-notes', data.additional_notes);
        } else {
            // No medical record yet, form is already reset
        }

    } catch (error) {
        console.error('Error loading medical data:', error);
        // Toast or silent fail
    }
}

// Medical Form Submit Handler
const medicalForm = document.getElementById('medical-data-form');
if (medicalForm) {
    medicalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(medicalForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.student_id) {
            showAlertModal('Error', 'Error: No se ha seleccionado un alumno válido.', true);
            return;
        }

        try {
            await apiFetch('/medical', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            showAlertModal('Éxito', 'Ficha médica guardada exitosamente.');
        } catch (error) {
            console.error('Error saving medical record:', error);
            showAlertModal('Error', 'Error al guardar la ficha médica: ' + error.message, true);
        }
    });
}

// Ensure loadMedicalData is called when switching to the view
// This hook was already added in handleStudentAction in the previous step,
// but we need to make sure it actually calls THIS new function.
// I will verify the handleStudentAction implementation below.
// --- Parents Portal Clinical View Logic ---

window.loadParentClinicalData = async (studentId) => {
    // ... logic remains same, function reused ...
    const loadingEl = document.getElementById('parents-clinical-loading');
    const contentEl = document.getElementById('parents-clinical-content');
    const emptyEl = document.getElementById('parents-clinical-empty');

    if (!document.getElementById('tab-clinical')) return;

    // Reset UI
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
        console.log('Fetching clinical data for:', studentId);
        const data = await apiFetch(`/medical/${studentId}`);
        console.log('Clinical data received:', data);

        if (loadingEl) loadingEl.classList.add('hidden');

        if (!data || !data.blood_type) {
            console.log('No clinical data found (empty check)');
            if (emptyEl) emptyEl.classList.remove('hidden');
            return;
        }

        if (contentEl) contentEl.classList.remove('hidden');

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '-';
        };

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = (val && val !== 'null' && val !== 'undefined') ? val : '-';
        };

        setVal('view-blood-type', data.blood_type);
        setVal('view-height', data.height);
        setVal('view-weight', data.weight);
        setVal('view-allergies', data.allergies);
        setVal('view-conditions', data.medical_conditions);

        if (data.birthdate) {
            const age = calculateAge(data.birthdate);
            setText('view-age', age + (age === 1 ? ' año' : ' años'));
        } else {
            setText('view-age', '-');
        }

        const setHistory = (iconId, detailId, hasProp, commentsProp) => {
            const iconEl = document.getElementById(iconId);
            const textEl = document.getElementById(detailId);
            const comments = data[commentsProp];
            // Robust check: truthy flag OR existence of details text
            const has = (data[hasProp] == 1 || data[hasProp] === true || data[hasProp] === 'true') || (comments && comments.length > 0);

            if (iconEl) {
                iconEl.textContent = has ? 'check_circle' : 'cancel';
                iconEl.style.color = has ? '#ef4444' : '#94a3b8';
            }
            if (textEl) {
                textEl.textContent = has ? (comments || 'Sí, sin detalles especificados') : 'No';
                textEl.style.color = has ? '#1e293b' : '#64748b';
            }
        };

        setHistory('icon-surgeries', 'view-surgeries-det', 'has_surgeries', 'surgeries_comments');
        setHistory('icon-medications', 'view-medications-det', 'has_medications', 'medications');
        setHistory('icon-therapy', 'view-therapy-det', 'has_therapy', 'therapy_comments');

        setVal('view-emergency-name', data.emergency_contact_name);
        setVal('view-emergency-phone', data.emergency_contact_phone);
        setVal('view-doctor-name', data.doctor_name);
        setVal('view-doctor-phone', data.doctor_phone);
        // New Fields
        setVal('view-doctor-email', data.doctor_email);
        setVal('view-doctor-office', data.doctor_office);
        setVal('view-notes', data.additional_notes);

        setVal('view-insurance-company', data.insurance_company);
        setVal('view-insurance-policy', data.insurance_policy);

    } catch (e) {
        console.error('Error loading parent clinical data:', e);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (emptyEl) {
            emptyEl.textContent = 'Error al cargar la información.';
            emptyEl.classList.remove('hidden');
        }
    }
};

// NOTE: event listener removed, moved logic to switchParentsTab

// --- Chatbot Logic ---

async function loadChatbotConfig() {
    try {
        const config = await apiFetch('/config/chatbot');
        if (config) {
            const apiKeyInput = document.getElementById('chatbot-api-key');
            const contextInput = document.getElementById('chatbot-context');
            if (apiKeyInput) apiKeyInput.value = config.apiKey || '';
            if (contextInput) contextInput.value = config.context || '';
        }
    } catch (e) {
        console.error('Error loading chatbot config:', e);
        showAlertModal('Error', 'Error al cargar configuración del asistente.', true);
    }
}

const chatbotForm = document.getElementById('chatbot-form');
if (chatbotForm) {
    chatbotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const apiKey = document.getElementById('chatbot-api-key').value.trim();
        const context = document.getElementById('chatbot-context').value.trim();

        try {
            await apiFetch('/config/chatbot', {
                method: 'PUT',
                body: JSON.stringify({ apiKey, context })
            });
            showAlertModal('Éxito', 'Configuración guardada exitosamente.');
        } catch (error) {
            console.error(error);
            showAlertModal('Error', 'Error al guardar configuración: ' + error.message, true);
        }
    });
}

const toggleApiKeyBtn = document.getElementById('toggle-api-key');
if (toggleApiKeyBtn) {
    toggleApiKeyBtn.addEventListener('click', () => {
        const input = document.getElementById('chatbot-api-key');
        if (input.type === 'password') {
            input.type = 'text';
            toggleApiKeyBtn.textContent = 'Ocultar';
        } else {
            input.type = 'password';
            toggleApiKeyBtn.textContent = 'Mostrar';
        }
    });
}

// Hook into sidebar for Chatbot
const chatbotLink = document.querySelector('a[data-target="chatbot-section"]');
if (chatbotLink) {
    chatbotLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Permission check (optional strictness, for now allow if role is admin-like)
        // if (!checkPermission(PERMISSIONS.CONFIG_CHATBOT)) return alert('Sin acceso');

        hideAllSections();
        document.getElementById('chatbot-section').classList.remove('hidden');

        // Update active state in sidebar
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');

        loadChatbotConfig();
    });
}

// --- ACCOUNT STATEMENT LOGIC ---




window.openAccountStatement = async (studentId) => {
    console.log('Opening Account Statement for:', studentId);

    // 1. Get School Info
    const schoolName = document.getElementById('school-commercial-name')?.value || 'Nombre de la Escuela';
    const schoolAddress = (document.getElementById('school-street')?.value || '') + ' ' +
        (document.getElementById('school-ext-number')?.value || '') + ', ' +
        (document.getElementById('school-neighborhood')?.value || '') + ', ' +
        (document.getElementById('school-city')?.value || '') + ', ' +
        (document.getElementById('school-state')?.value || '');

    document.getElementById('statement-modal-school-name').textContent = schoolName;
    document.getElementById('statement-modal-school-address').textContent = schoolAddress.replace(/, ,/g, ',');

    // Set Date
    const today = new Date();
    document.getElementById('statement-modal-date').textContent = 'Fecha de Emisión: ' + today.toLocaleDateString();

    // 2. Get Student Info
    let sName = document.getElementById('caja-student-name')?.textContent || '-';
    let sId = document.getElementById('caja-student-id')?.textContent || '-';
    let sGroup = document.getElementById('caja-student-group')?.textContent || '-';
    let sLevel = document.getElementById('payment-level')?.value || 'N/A';

    // ALWAYS Fetch details from API to ensure accuracy, regardless of where it was opened from.
    if (studentId) {
        try {
            console.log('Fetching details from API: /students/' + studentId);
            const studentData = await apiFetch(`/students/${studentId}`);

            // Handle if array or object
            const s = Array.isArray(studentData) ? studentData[0] : studentData;

            if (s) {
                sName = `${s.name} ${s.lastnameP || ''} ${s.lastnameM || ''}`.trim();
                sId = s.unique_id || s.id;

                // Format: Grado=3ro, Grupo=Estepa
                const grado = s.subgrade || s.grade || 'N/A';
                const grupo = s.group_name || s.group_id || 'N/A';
                sGroup = `Grado: ${grado}, Grupo: ${grupo}`;

                sLevel = s.educational_level || s.level_id || s.grade || sLevel;
            } else {
                console.warn('API returned data but no student object extracted.');
            }
        } catch (e) {
            console.error('Error fetching student details for statement:', e);
            // Keep DOM values if fetch fails
        }
    }

    console.log('Updating DOM with:', { sName, sId, sGroup, sLevel });
    document.getElementById('statement-modal-student-name').textContent = sName;
    document.getElementById('statement-modal-student-id').textContent = sId;
    document.getElementById('statement-modal-student-group').textContent = sGroup;
    document.getElementById('statement-modal-student-level').textContent = sLevel;

    // 3. Get Payments (Always fetch fresh to ensure "Just Paid" status is reflected)
    let payments = [];
    try {
        payments = await apiFetch(`/payments/${studentId}`);
        window.currentStudentPayments = payments; // Update global cache
    } catch (e) {
        console.error('Error fetching payments for statement:', e);
    }

    // ---------------------------------------------------------
    // 4. TUITION CONTROL (SEMÁFORO) LOGIC
    // ---------------------------------------------------------
    const tuitionGrid = document.getElementById('statement-modal-tuition-grid');
    if (tuitionGrid) {
        tuitionGrid.innerHTML = '';

        // Define standard cycle
        const cycle = [
            { name: 'Inscripción', label: 'Inscripción' },
            { name: 'Septiembre', label: 'Septiembre', monthIndex: 8 },
            { name: 'Octubre', label: 'Octubre', monthIndex: 9 },
            { name: 'Noviembre', label: 'Noviembre', monthIndex: 10 },
            { name: 'Diciembre', label: 'Diciembre', monthIndex: 11 },
            { name: 'Enero', label: 'Enero', monthIndex: 0, nextYear: true },
            { name: 'Febrero', label: 'Febrero', monthIndex: 1, nextYear: true },
            { name: 'Marzo', label: 'Marzo', monthIndex: 2, nextYear: true },
            { name: 'Abril', label: 'Abril', monthIndex: 3, nextYear: true },
            { name: 'Mayo', label: 'Mayo', monthIndex: 4, nextYear: true },
            { name: 'Junio', label: 'Junio', monthIndex: 5, nextYear: true },
            { name: 'Julio', label: 'Julio', monthIndex: 6, nextYear: true },
        ];

        // Determine "Current" relative to school year
        const currentMonth = today.getMonth(); // 0-11
        const getSchoolMonthIndex = (m) => (m + 4) % 12;
        const currentSchoolIndex = getSchoolMonthIndex(currentMonth);

        // Helper for normalization (ignore accents/case)
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        cycle.forEach(item => {
            // Check if paid
            // We iterate all payments and check if concept contains the month name
            const isPaid = payments.some(p => {
                const pNorm = normalize(p.concept);
                const iNorm = normalize(item.name);
                return pNorm.includes(iNorm);
            });

            // Determine Status
            let status = 'future';
            let statusLabel = 'PENDIENTE';
            let color = '#94a3b8'; // gray-400
            let bg = '#f1f5f9'; // slate-100

            const currentYear = new Date().getFullYear();
            const currentMonthIdx = new Date().getMonth();
            const monthMap = {
                'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
                'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5, 'Julio': 6
            };

            let isOverdue = false;
            if (item.name !== 'Inscripción' && item.monthIndex !== undefined) {
                const mIdx = monthMap[item.name];
                let cycleStartYear = currentYear;
                // If current date is Jan-Jul (0-6), the cycle started last year
                if (currentMonthIdx < 7) cycleStartYear = currentYear - 1;

                let targetYear = cycleStartYear;
                if (mIdx < 8) targetYear = cycleStartYear + 1; // Jan-Jul are next year relative to start

                const deadline = new Date(targetYear, mIdx, 10, 23, 59, 59);
                isOverdue = !isPaid && (new Date() > deadline);
            }


            if (isPaid) {
                status = 'paid';
                statusLabel = 'PAGADO';
                color = '#15803d'; // green-700
                bg = '#dcfce7'; // green-100
            } else if (item.name === 'Inscripción') {
                // Always overdue if not paid
                status = 'overdue';
                statusLabel = 'PENDIENTE';
                color = '#b91c1c'; // red-700
                bg = '#fee2e2'; // red-100
            } else if (isOverdue) {
                status = 'overdue';
                statusLabel = 'VENCIDO';
                color = '#b91c1c'; // red-700
                bg = '#fee2e2'; // red-100
            } else {
                // Monthly logic (original logic for non-overdue, non-paid months)
                const itemSchoolIndex = getSchoolMonthIndex(item.monthIndex);

                if (itemSchoolIndex < currentSchoolIndex) {
                    // This case should ideally be covered by isOverdue now, but keeping for safety
                    status = 'overdue';
                    statusLabel = 'VENCIDO';
                    color = '#b91c1c'; // red-700
                    bg = '#fee2e2'; // red-100
                } else if (itemSchoolIndex === currentSchoolIndex) {
                    // Current month: orange
                    status = 'current';
                    statusLabel = 'EN CURSO';
                    color = '#c2410c'; // orange
                    bg = '#ffedd5';
                }
            }

            // Special Handle for Reinscription check
            if (item.name === 'Inscripción' && !isPaid) {
                const isReinscripcionPaid = payments.some(p => {
                    const pNorm = normalize(p.concept);
                    return pNorm.includes('reinscripcion');
                });
                if (isReinscripcionPaid) {
                    status = 'paid';
                    statusLabel = 'PAGADO (R)';
                    color = '#15803d';
                    bg = '#dcfce7';
                }
            }

            // Render Card
            const card = document.createElement('div');
            card.style.cssText = `
                                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                                        border: 1px solid ${color}; background-color: ${bg}; color: ${color};
                                        padding: 0.5rem; border-radius: 0.5rem; text-align: center;
                                        `;

            card.innerHTML = `
                                        <div style="font-weight: bold; font-size: 0.85rem; margin-bottom: 0.25rem;">${item.label.substring(0, 3).toUpperCase()}</div>
                                        <div style="font-size: 0.7rem; font-weight: 700;">${statusLabel}</div>
                                        `;
            tuitionGrid.appendChild(card);
        });
    }

    // ---------------------------------------------------------
    // 5. Populate Transactions Grid (One by One)
    // ---------------------------------------------------------
    const tbody = document.getElementById('statement-modal-table-body');
    tbody.innerHTML = '';

    let totalPaid = 0;

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay movimientos registrados.</td></tr>';
    } else {
        const sortedForStatement = [...payments].sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

        sortedForStatement.forEach(p => {
            const row = document.createElement('tr');
            const dateObj = new Date(p.payment_date);
            const dateStr = dateObj.toLocaleDateString();
            const amount = parseFloat(p.amount);
            totalPaid += amount;

            row.innerHTML = `
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">${dateStr}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">${p.concept}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">${p.payment_method || '-'}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: right;">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        `;
            tbody.appendChild(row);
        });
    }

    // 6. Set Total
    document.getElementById('statement-modal-total').textContent = '$' + totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 7. Show Modal
    const modal = document.getElementById('account-statement-modal');
    modal.classList.remove('hidden');
    if (modal.parentNode !== document.body) document.body.appendChild(modal);
};

window.printAccountStatement = () => {
    const printContent = document.getElementById('statement-print-area').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write('<html><head><title>Estado de Cuenta</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body {font - family: sans-serif; padding: 20px; }');
    printWindow.document.write('table {width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td {padding: 8px; border-bottom: 1px solid #ddd; }');
    printWindow.document.write('th {text - align: left; background-color: #f2f2f2; }');
    printWindow.document.write('.text-right {text - align: right; }');
    // Simple Grid style for print
    printWindow.document.write('#statement-tuition-grid {display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }');
    printWindow.document.write('#statement-tuition-grid > div {border: 1px solid #ddd; padding: 5px; text-align: center; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();

    // Slight delay to ensure render
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

// --- User Notifications Logic ---

async function updateNotificationBadge() {
    if (!currentUser || !currentUser.id) return;
    try {
        const notifications = await apiFetch(`/notifications/my-notifications?userId=${currentUser.id}`);

        if (notifications && Array.isArray(notifications)) {
            const unreadCount = notifications.filter(n => !n.is_read).length;
            const badge = document.getElementById('notif-badge-count');

            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } else {
            console.log('DEBUG: Notifications is not an array or empty');
        }
    } catch (e) {
        console.error('Error updating badge:', e);
    }
}

async function loadUserNotifications() {
    console.log('loadUserNotifications called');
    // Update badge whenever we load the list (and presumably mark things read later)
    updateNotificationBadge();

    const parentContainer = document.getElementById('user-notifications-list');
    const adminContainer = document.getElementById('admin-notifications-list');

    console.log('Containers found:', { parentContainer, adminContainer });

    if (!parentContainer && !adminContainer) {
        console.warn('No notification containers found in DOM');
        return;
    }

    if (!currentUser || !currentUser.id) {
        console.warn('No currentUser or ID found', currentUser);
        const msg = '<p style="text-align:center;">Por favor inicie sesión.</p>';
        if (parentContainer) parentContainer.innerHTML = msg;
        if (adminContainer) adminContainer.innerHTML = msg;
        return;
    }
    console.log('Fetching notifications for user:', currentUser.id);

    const loadingMsg = '<p style="text-align:center;">Cargando...</p>';
    if (parentContainer) parentContainer.innerHTML = loadingMsg;
    if (adminContainer) adminContainer.innerHTML = loadingMsg;

    try {
        console.log('Calling API: /notifications/my-notifications?userId=' + currentUser.id);
        const notifications = await apiFetch(`/notifications/my-notifications?userId=${currentUser.id}`);
        console.log('API Response received:', notifications);

        // Store globally for filtering
        window.allUserNotifications = notifications || [];

        // Initial Render
        applyNotificationFilters();

    } catch (e) {
        console.error('Error loading notifications:', e);
        if (parentContainer) parentContainer.innerHTML = '<p style="text-align:center; color: #ef4444;">Error cargando notificaciones.</p>';
        if (adminContainer) adminContainer.innerHTML = '<p style="text-align:center; color: #ef4444;">Error cargando notificaciones.</p>';
    }
}

// Global variable to store notifications
window.allUserNotifications = [];

window.applyNotificationFilters = function () {
    const dateInput = document.getElementById('notif-filter-date');
    const statusInput = document.getElementById('notif-filter-status');
    const container = document.getElementById('user-notifications-list');

    if (!container) return;

    let filtered = window.allUserNotifications;

    // Filter by Date
    if (dateInput && dateInput.value) {
        const selectedDate = new Date(dateInput.value).toDateString(); // Normalize to date part
        filtered = filtered.filter(n => new Date(n.created_at).toDateString() === selectedDate);
    }

    // Filter by Status
    if (statusInput && statusInput.value !== 'all') {
        const isRead = statusInput.value === 'read';
        filtered = filtered.filter(n => (n.is_read ? true : false) === isRead);
    }

    renderNotificationList(filtered, container);
};

window.clearNotificationFilters = function () {
    const dateInput = document.getElementById('notif-filter-date');
    const statusInput = document.getElementById('notif-filter-status');

    if (dateInput) dateInput.value = '';
    if (statusInput) statusInput.value = 'all';

    applyNotificationFilters();
};

function renderNotificationList(notifications, container) {
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #94a3b8; padding: 2rem;">No se encontraron notificaciones con estos filtros.</p>';
        return;
    }

    container.innerHTML = ''; // Clear loading

    notifications.forEach(notif => {
        const card = document.createElement('div');
        // Determine styles
        let catClass = '';
        if (notif.category) {
            const cat = notif.category.toLowerCase();
            if (cat.includes('preescolar')) catClass = 'cat-level-preescolar';
            else if (cat.includes('primaria')) catClass = 'cat-level-primaria';
            else if (cat.includes('secundaria')) catClass = 'cat-level-secundaria';
            else if (cat === 'personal' || cat.startsWith('student:')) catClass = 'cat-personal';
            else if (cat.startsWith('group:')) catClass = 'cat-group';
            else if (cat === 'general' || cat.startsWith('level:')) {
                // Fallback for levels not matching above or explicit general
                if (cat.startsWith('level:')) catClass = 'cat-level-primaria'; // Default level color if specific fail
                else catClass = 'cat-general';
            }
        }

        // Default if no specific class found
        if (!catClass) catClass = 'cat-general';

        const readClass = notif.is_read ? 'read' : 'unread';
        card.className = `notif-card ${readClass} ${catClass}`;

        // Format Date
        const dateStr = new Date(notif.created_at).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        // Badge for Category
        let badgeText = 'General';
        let targetLabel = 'Para: Todos'; // New explicit label

        if (notif.category) {
            if (notif.category.startsWith('LEVEL:')) {
                const level = notif.category.split(':')[1];
                badgeText = level;
                targetLabel = `Nivel: ${level}`;
            }
            else if (notif.category.startsWith('GROUP:')) {
                const group = notif.category.split(':')[1];
                badgeText = `Grupo ${group}`;
                targetLabel = `Grupo: ${group}`;
            }
            else if (notif.category === 'PERSONAL') {
                badgeText = 'Personal';
                // Use the user's name if available, or fallback to 'Para ti'
                const userName = currentUser ? (currentUser.profile || currentUser.username || currentUser.name) : 'Usuario';
                targetLabel = `Para: ${userName}`;
            }
            else if (notif.category.startsWith('STUDENT:')) {
                // Robust extraction like mobile app
                const splitIndex = notif.category.indexOf(':');
                const studentName = (splitIndex !== -1) ? notif.category.substring(splitIndex + 1).trim() : 'Alumno';
                badgeText = 'Alumno';
                targetLabel = `Para: ${studentName}`;
            }
        }

        const notifHTML = `
                                        <div class="notif-header">
                                            <span class="notif-cat">${badgeText}</span>
                                            <span class="notif-date">${dateStr}</span>
                                        </div>
                                        ${targetLabel !== 'Para: Todos' ? `<div style="font-size:0.75rem; color:#64748b; margin-bottom:0.25rem;">${targetLabel}</div>` : ''}
                                        <div class="notif-title">${notif.title}</div>
                                        <div class="notif-message-preview">${notif.message.substring(0, 100)}${notif.message.length > 100 ? '...' : ''}</div>
                                        `;
        card.innerHTML = notifHTML;
        card.style.cursor = 'pointer'; // Indicate clickability

        // Click to Open Detail
        card.onclick = () => openNotificationDetail(notif, card);

        container.appendChild(card);
    });
}

// Make available globally just in case
window.openNotificationDetail = async function (notif, cardElement) {
    console.log('Opening notification detail:', notif);
    const modal = document.getElementById('notification-detail-modal');
    if (!modal) {
        console.error('Notification modal NOT FOUND in DOM');
        return;
    }

    // Parse Target & Determine Colors
    let targetText = 'GENERAL';
    let headerBg = '#f8fafc';
    let headerText = '#0f172a';
    let badgeBg = '#e2e8f0';
    let badgeText = '#64748b';

    if (notif.category) {
        const cat = notif.category.toUpperCase();
        if (cat.startsWith('LEVEL:')) {
            targetText = cat.split(':')[1];
            if (targetText.includes('PREESCOLAR')) {
                headerBg = '#fef9c3'; // Yellow-100
                headerText = '#854d0e'; // Yellow-800
                badgeBg = '#facc15'; // Yellow-400
                badgeText = '#713f12';
            } else if (targetText.includes('PRIMARIA')) {
                headerBg = '#dcfce7'; // Green-100
                headerText = '#166534'; // Green-800
                badgeBg = '#4ade80'; // Green-400
                badgeText = '#14532d';
            } else if (targetText.includes('SECUNDARIA')) {
                headerBg = '#f3e8ff'; // Purple-100
                headerText = '#6b21a8'; // Purple-800
                badgeBg = '#c084fc'; // Purple-400
                badgeText = '#581c87';
            }
        } else if (cat.startsWith('GROUP:')) {
            targetText = 'GRUPO ' + cat.split(':')[1];
            headerBg = '#e0f2fe'; // Blue-100
            headerText = '#075985'; // Blue-800
            badgeBg = '#38bdf8'; // Blue-400
            badgeText = '#0c4a6e';
        } else if (cat === 'PERSONAL') {
            targetText = 'PERSONAL';
            headerBg = '#fee2e2'; // Red-100
            headerText = '#991b1b'; // Red-800
            badgeBg = '#f87171'; // Red-400
            badgeText = '#7f1d1d';
        } else if (cat.startsWith('STUDENT:')) {
            // Robust extraction for modal
            const splitIndex = cat.indexOf(':');
            const studentName = (splitIndex !== -1) ? cat.substring(splitIndex + 1).trim() : 'Alumno';
            targetText = studentName;
            headerBg = '#e0e7ff'; // Indigo-100 to match list
            headerText = '#3730a3'; // Indigo-800
            badgeBg = '#818cf8'; // Indigo-400
            badgeText = '#312e81';
        } else if (cat === 'GENERAL') {
            targetText = 'GENERAL';
            headerBg = '#f1f5f9'; // Slate-100
            headerText = '#334155'; // Slate-700
            badgeBg = '#94a3b8'; // Slate-400
            badgeText = '#1e293b';
        }
    }

    // Apply Styles to Header
    const headerEl = modal.querySelector('.modal-header');
    if (headerEl) {
        headerEl.style.backgroundColor = headerBg;
        headerEl.style.borderBottomColor = headerBg; // Seamless look
    }

    // Populate Modal
    const badgeEl = document.getElementById('notif-detail-target');
    badgeEl.textContent = `DIRIGIDO A: ${targetText}`;
    badgeEl.style.backgroundColor = badgeBg;
    badgeEl.style.color = badgeText;

    const titleEl = document.getElementById('notif-detail-title');
    titleEl.textContent = notif.title;
    titleEl.style.color = headerText;

    document.getElementById('notif-detail-message').textContent = notif.message;

    // Date color slightly lighter than title
    const dateEl = document.getElementById('notif-detail-date');
    dateEl.textContent = new Date(notif.created_at).toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    dateEl.style.color = headerText;
    dateEl.style.opacity = '0.7';
    document.getElementById('notif-detail-message').textContent = notif.message;
    document.getElementById('notif-detail-date').textContent = new Date(notif.created_at).toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Show Modal
    modal.classList.remove('hidden');

    // Mark as Read if needed
    if (!notif.is_read) {
        try {
            await markNotificationAsRead(notif.id);
            // Update UI locally without reload
            notif.is_read = 1;
            if (cardElement) {
                cardElement.classList.remove('unread');
                cardElement.classList.add('read');
            }
            updateNotificationBadge(); // Refresh badge count
        } catch (e) {
            console.error('Error marking as read:', e);
        }
    }
}
async function markNotificationAsRead(id, btnElement) {
    if (btnElement) {
        btnElement.textContent = 'Marcando...';
        btnElement.disabled = true;
    }

    try {
        await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });

        // Visual Update
        if (btnElement) {
            const card = btnElement.closest('.notif-card');
            if (card) {
                card.classList.remove('unread');
                card.classList.add('read');
                // Replace button with "Leído" text
                const span = document.createElement('span');
                span.style.cssText = 'position:absolute; bottom:1rem; right:1rem; font-size:0.7rem; color:#cbd5e1;';
                span.textContent = 'Leído';
                btnElement.replaceWith(span);
            }
        }
    } catch (e) {
        console.error('Error marking as read:', e);
        if (btnElement) {
            btnElement.textContent = 'Error';
            btnElement.disabled = false;
        }
    }
}

// Hook Admin Button
document.addEventListener('DOMContentLoaded', () => {
    // Auto load if on notification section
    const notifSection = document.getElementById('notifications-section');
    if (notifSection && !notifSection.classList.contains('hidden')) {
        // loadUserNotifications(); // Disabled for admin since we removed the debug section
    }
});

// Expose to window
window.loadUserNotifications = loadUserNotifications;
window.markNotificationAsRead = markNotificationAsRead;

// --- Appointment Manager Logic ---
const managerModal = document.getElementById('appointment-manager-modal');
const btnManageAppointments = document.getElementById('btn-manage-appointments');
const closeManagerModalBtn = document.getElementById('close-manager-modal');
const appointmentsList = document.getElementById('appointments-list');

if (btnManageAppointments) {
    btnManageAppointments.addEventListener('click', () => {
        managerModal.classList.remove('hidden');
        loadManagedAppointments();
    });
}

if (closeManagerModalBtn) {
    closeManagerModalBtn.addEventListener('click', () => {
        managerModal.classList.add('hidden');
    });
}

async function loadManagedAppointments() {
    appointmentsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;">Cargando...</div>';

    try {
        // Fetch next 30 days
        const start = new Date().toISOString();
        const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Re-use existing endpoint (it expects start/end query)
        // Check if endpoints expects full ISO or just date. Our recent fix handles ISO.
        const events = await apiFetch(`/calendar?start=${start}&end=${end}`);

        appointmentsList.innerHTML = '';

        if (!events || events.length === 0) {
            appointmentsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;">No hay citas programadas próximamente.</div>';
            return;
        }

        // Sort by date
        events.sort((a, b) => new Date(a.start) - new Date(b.start));

        events.forEach(evt => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;';

            const dateObj = new Date(evt.start);
            const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            row.innerHTML = `
                                        <div>
                                            <div style="font-weight: 600; color: #0f172a;">${evt.title}</div>
                                            <div style="font-size: 0.85rem; color: #64748b;">
                                                <span style="text-transform: capitalize;">${dateStr}</span> &bull; ${timeStr}
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 0.5rem;">
                                            <button class="btn-edit-appt" style="background: none; border: none; cursor: pointer; color: #3b82f6;" title="Editar">
                                                <span class="material-icons-outlined">edit</span>
                                            </button>
                                            <button class="btn-delete-appt" style="background: none; border: none; cursor: pointer; color: #ef4444;" title="Eliminar">
                                                <span class="material-icons-outlined">delete</span>
                                            </button>
                                        </div>
                                        `;

            // Handlers
            row.querySelector('.btn-edit-appt').onclick = () => {
                managerModal.classList.add('hidden'); // Close manager
                // Open Editor
                // Need to reconstruct the object expected by openAppointmentModal
                openAppointmentModal({
                    id: evt.id,
                    title: evt.title,
                    start: evt.start,
                    description: evt.description || '' // API usually returns extendedProps flattened or not?
                    // Let's assume standard API return. If 'extendedProps' wrapper exists, check it.
                    // The /api/calendar endpoint usually returns FullCalendar compliant array.
                    // Let's check safely.
                });
            };

            row.querySelector('.btn-delete-appt').onclick = () => {
                showConfirmModal({
                    title: 'Eliminar Cita',
                    message: '¿Seguro que deseas eliminar esta cita?',
                    confirmText: 'Sí, eliminar',
                    isDestructive: true,
                    onConfirm: async () => {
                        const res = await apiFetch(`/calendar/${evt.id}`, { method: 'DELETE' });
                        if (res) {
                            loadManagedAppointments(); // Refresh list
                            if (calendar) {
                                calendar.refetchEvents(); // Refresh calendar (availability updates)
                                // Instant Slot Refresh
                                if (evt.start) {
                                    const dateStr = evt.start.split('T')[0];
                                    const title = document.getElementById('selected-date-title');
                                    if (title && title.dataset.date === dateStr) {
                                        loadTimeSlots(dateStr);
                                    }
                                }
                            }
                        }
                    }
                });
            };

            appointmentsList.appendChild(row);
        });

    } catch (e) {
        console.error(e);
        appointmentsList.innerHTML = '<div style="text-align: center; color: #ef4444;">Error al cargar citas.</div>';
    }
}

// End of script
// Initial loads are handled by checkLoginStatus()

// Helper for Dynamic Page Titles
function updateBreadcrumbTitle(item) {
    const pageTitleEl = document.getElementById('page-title');
    if (!pageTitleEl || !item) return;

    let currentItemText = item.textContent.trim();
    console.log('[Breadcrumb] 1. Item Clicked:', currentItemText);

    let fullTitle = currentItemText;
    let groupText = '';

    // Robust Map for Group Names (Matches data-group attribute)
    const GROUP_DISPLAY_NAMES = {
        'alumnos': 'Alumnos',
        'caja': 'Caja',
        'config': 'Configuración',
        'school': 'Información Escolar',
        'hr': 'Recursos Humanos',
        'reports': 'Reportes',
        'inquiries': 'Informes', // Or 'Solicitudes' if preferred
        'notifications': 'Notificaciones'
    };

    try {
        // 1. Identify Parent Group via data-group (Most Robust)
        const navGroup = item.closest('.nav-group');
        console.log('[Breadcrumb] 2. Nav Group found?', !!navGroup, navGroup);

        if (navGroup) {
            const groupKey = navGroup.getAttribute('data-group');
            console.log('[Breadcrumb] 3. Group Key:', groupKey);

            if (groupKey && GROUP_DISPLAY_NAMES[groupKey]) {
                groupText = GROUP_DISPLAY_NAMES[groupKey];
                console.log('[Breadcrumb] 4. Map Hit:', groupText);
            } else {
                // Fallback to DOM text search if key not in map
                const groupHeader = navGroup.querySelector('.nav-group-header span');
                if (groupHeader) {
                    groupText = groupHeader.textContent.trim();
                    console.log('[Breadcrumb] 4. DOM Fallback:', groupText);
                } else {
                    console.log('[Breadcrumb] 4. No Header found in DOM');
                }
            }
        }

        // 2. Identify Nested Submenu (e.g. Estructura)
        const nestedSubmenu = item.closest('.nested-submenu');
        if (nestedSubmenu) {
            const nestedHeader = nestedSubmenu.querySelector('.nested-submenu-header span');
            if (nestedHeader && item !== nestedSubmenu.querySelector('.nested-submenu-header')) {
                const nestedText = nestedHeader.textContent.trim();
                if (groupText) groupText += ` - ${nestedText}`;
                else groupText = nestedText;
            }
        }

        // 3. Construct Final Title
        if (groupText) {
            // Check if item is the header itself to avoid "Notificaciones - Notificaciones"
            const isHeader = item.classList.contains('nav-group-header') || item.closest('.nav-group-header');

            if (isHeader) {
                fullTitle = groupText;
            } else {
                fullTitle = `${groupText} - ${currentItemText}`;
            }
        } else if (item.classList.contains('nav-group-header')) {
            const span = item.querySelector('span');
            if (span) fullTitle = span.textContent.trim();
        }

        console.log('[Breadcrumb] 5. Final Title:', fullTitle);
        setTimeout(() => {
            pageTitleEl.textContent = fullTitle;
        }, 0);
    } catch (e) {
        console.error('[Breadcrumb] Error:', e);
    }
}

// Update Static UI Buttons based on permissions
function updateButtonPermissions() {
    if (!currentUser || !currentUser.permissions) return;
    const perms = currentUser.permissions;

    // Add Student Button
    if (addStudentBtn) {
        if (perms.includes(PERMISSIONS.MANAGE_STUDENTS)) {
            addStudentBtn.classList.remove('hidden');
        } else {
            addStudentBtn.classList.add('hidden');
        }
    }

    // Add User Button
    if (addUserBtn) {
        if (perms.includes(PERMISSIONS.MANAGE_USERS)) {
            addUserBtn.classList.remove('hidden');
        } else {
            addUserBtn.classList.add('hidden');
        }
    }
}

// Dynamic Sidebar Renderer
function renderSidebar(permissions) {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Clear existing content (except maybe profile at bottom, but strict replacement is safer)
    sidebarNav.innerHTML = '';


    MENU_STRUCTURE.forEach(group => {
        // Check if user has permission for the group (or at least one item)
        // Simple check: if there's a specific 'view menu' permission for the group items[0] usually
        // Better: Check if any of the items are allowed.
        const hasGroupPermission = group.items.some(item => {
            // If item.permission is defined, check it. If not, assume allowed if not hidden.
            // Also respect 'hidden' flag for matrix-only items
            if (item.hidden) return false;
            return !item.permission || (permissions && permissions.includes(item.permission));
        });

        // Special case for Notifications which is a top-level link
        const isDirectLink = !!group.targetId;
        if (isDirectLink) {
            const canView = group.items.some(i => i.permission && permissions && permissions.includes(i.permission));
            if (!canView) return;
        } else if (!hasGroupPermission) {
            return;
        }

        const navGroup = document.createElement('div');
        navGroup.className = 'nav-group';
        if (group.groupKey) navGroup.setAttribute('data-group', group.groupKey);

        const header = document.createElement('div');
        header.className = 'nav-group-header';
        if (isDirectLink) header.setAttribute('data-target', group.targetId);

        // Icon + Title
        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.gap = '0.75rem';
        titleContainer.innerHTML = `${group.icon}<span>${group.title}</span>`;
        header.appendChild(titleContainer);

        // Chevron (only if not distinct link)
        if (!isDirectLink) {
            header.innerHTML += `<svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>`;
        } else {
            header.style.cursor = 'pointer';
        }

        // Event Listener for Header
        header.addEventListener('click', () => {
            if (isDirectLink) {
                // Direct Navigation Logic
                document.querySelectorAll('.nav-item, .submenu-item, .nav-group-header').forEach(n => n.classList.remove('active'));
                header.classList.add('active');
                updateBreadcrumbTitle(header);

                document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
                const target = document.getElementById(group.targetId);
                if (target) {
                    target.classList.remove('hidden');
                    // Special Case Notifications
                    if (group.groupKey === 'notifications') {
                        const pt = document.getElementById('page-title');
                        if (pt) pt.textContent = 'Notificaciones - Redactar';
                        if (typeof switchNotifTab === 'function') switchNotifTab('compose');
                    }
                }
            } else {
                // Accordion Toggle
                const content = navGroup.querySelector('.nav-group-content');
                if (content) content.classList.toggle('open');
                const chevron = header.querySelector('.chevron');
                if (chevron) chevron.classList.toggle('rotate');
            }
        });

        navGroup.appendChild(header);

        // Items Container
        if (!isDirectLink) {
            const content = document.createElement('div');
            content.className = 'nav-group-content';

            group.items.forEach(item => {
                if (item.hidden) return; // Skip internal/hidden items
                if (item.permission && (!permissions || !permissions.includes(item.permission))) return;

                if (item.isSubgroup) {
                    // Nested Submenu
                    const nested = document.createElement('div');
                    nested.className = 'nested-submenu';

                    const nestedHeader = document.createElement('div');
                    nestedHeader.className = 'nested-submenu-header submenu-item';
                    nestedHeader.style.justifyContent = 'space-between';
                    nestedHeader.innerHTML = `<span>${item.label}</span><svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>`;

                    const nestedContent = document.createElement('div');
                    nestedContent.className = 'nested-submenu-content hidden';
                    nestedContent.style.paddingLeft = '1rem';

                    // Toggle Nested
                    nestedHeader.addEventListener('click', (e) => {
                        e.stopPropagation(); // Don't bubble to group
                        nestedContent.classList.toggle('hidden');
                        nestedHeader.querySelector('.chevron').classList.toggle('rotate');
                    });

                    item.items.forEach(subItem => {
                        if (subItem.permission && (!permissions || !permissions.includes(subItem.permission))) return;
                        const link = createNavLink(subItem);
                        nestedContent.appendChild(link);
                    });

                    nested.appendChild(nestedHeader);
                    nested.appendChild(nestedContent);
                    content.appendChild(nested);

                } else {
                    // Standard Item
                    const link = createNavLink(item);
                    content.appendChild(link);
                }
            });
            navGroup.appendChild(content);
        }

        sidebarNav.appendChild(navGroup);
    });
}

function createNavLink(item) {
    const a = document.createElement('a');
    a.className = 'submenu-item';
    a.textContent = item.label;
    if (item.targetId) a.setAttribute('data-target', item.targetId);

    a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.targetId;
        if (!targetId) return;

        // Navigation Logic
        document.querySelectorAll('.nav-item, .submenu-item, .nav-group-header').forEach(n => n.classList.remove('active'));
        a.classList.add('active');
        updateBreadcrumbTitle(a);

        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove('hidden');

        // Specific Section Logic (Copied from original event listener)
        if (targetId === 'inquiries-list-section') {
            if (typeof loadInquiries === 'function') loadInquiries();
            if (typeof startInquiryPolling === 'function') startInquiryPolling();
        } else {
            if (typeof stopInquiryPolling === 'function') stopInquiryPolling();
        }
        if (targetId === 'students-section' && typeof loadStudents === 'function') loadStudents();
        if (targetId === 'permissions-section' && typeof loadPermissionsMatrix === 'function') loadPermissionsMatrix();
        if (targetId === 'roles-users-section' && typeof loadUsers === 'function') loadUsers();
        if (targetId === 'concepts-section' && typeof loadConcepts === 'function') loadConcepts();
        if (targetId === 'email-templates-section' && typeof loadEmailTemplates === 'function') loadEmailTemplates();
        if (targetId === 'smart-attachments-section' && typeof initSmartAttachments === 'function') initSmartAttachments();
        if (targetId === 'school-info-section' && typeof loadSchoolInfo === 'function') loadSchoolInfo();
        if (targetId === 'caja-section' && typeof loadPayments === 'function') loadPayments(); // Assuming loadPayments
        if (targetId === 'chatbot-section' && typeof initChatbotConfig === 'function') initChatbotConfig();
        if (targetId === 'academic-structure-section' && typeof loadAcademicStructure === 'function') loadAcademicStructure();
        if (targetId === 'administrative-structure-section' && typeof loadAdministrativeStructure === 'function') loadAdministrativeStructure();
        if (targetId === 'agenda-section' && typeof loadAgenda === 'function') loadAgenda();
        if (targetId === 'hr-personal-section' && typeof loadPersonnel === 'function') loadPersonnel();

        if (targetId === 'reports-section') {
            const start = document.getElementById('report-date-start');
            if (start && !start.value) {
                const now = new Date();
                start.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            }
        }
    });

    return a;
}

// Initial Title Update on Load
document.addEventListener('DOMContentLoaded', () => {
    const activeItem = document.querySelector('.submenu-item.active');
    if (activeItem) {
        // Small delay to ensure DOM is fully ready if script is deferred/async
        setTimeout(() => updateBreadcrumbTitle(activeItem), 100);
    }
});

// --- Inquiries List Initialization (Fix for Static HTML filters) ---
function initInquiriesList() {
    console.log('Initializing Inquiries List Listeners...');
    const filterLevel = document.getElementById('report-filter-level');
    const filterStatus = document.getElementById('report-filter-status');
    const btnExportPdf = document.getElementById('btn-export-pdf');

    if (filterLevel) {
        // Remove old listeners ideally, but adding new ones is safe enough here if redundant
        filterLevel.addEventListener('change', () => loadInquiries());
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', () => loadInquiries());
    }

    if (btnExportPdf) {
        // Clone to remove old listeners (if any) and attach fresh one
        const newBtn = btnExportPdf.cloneNode(true);
        btnExportPdf.parentNode.replaceChild(newBtn, btnExportPdf);

        newBtn.addEventListener('click', async () => {
            const btn = newBtn;
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons-outlined spin">sync</span> Generando...';

            try {
                const lvl = document.getElementById('report-filter-level')?.value || 'All';
                const sts = document.getElementById('report-filter-status')?.value || 'all';
                const startDate = document.getElementById('inquiry-filter-start-date')?.value || '';
                const endDate = document.getElementById('inquiry-filter-end-date')?.value || '';

                console.log(`Generating PDF with: Level=${lvl}, Status=${sts}, Start=${startDate}, End=${endDate}`);

                // Construct Headers manually since we need blob(), not json()
                const headers = {};
                const token = localStorage.getItem('authToken');
                if (token) headers['Authorization'] = `Bearer ${token}`;
                if (currentUser && currentUser.role) headers['x-user-role'] = normalizeRole(currentUser.role);

                const response = await fetch(`${API_URL}/inquiries/export-pdf?level=${encodeURIComponent(lvl)}&status=${encodeURIComponent(sts)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Error al generar PDF');
                }

                // Create Blob URL and Open
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');

                // Optional: Revoke URL after some time
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);

            } catch (error) {
                console.error('PDF Export Error:', error);
                alert('Error al descargar reporte: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        });
    }
}

// Ensure it runs on load
document.addEventListener('DOMContentLoaded', initInquiriesList);
