import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');
    if (token) {
        // Note: The backend expects x-user-role logic for some things, 
        // but mainly we might handle auth via session or headers.
        // Ideally existing backend uses standard Authentication? 
        // Looking at app.js, it seems 'x-user-role' is used for permission check mocks?
        // We will mimic app.js apiFetch logic.
        if (role) config.headers['x-user-role'] = role;
    }
    return config;
});

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.user) {
            const { user } = response.data;
            await AsyncStorage.setItem('userToken', 'dummy-token-if-none'); // Backend doesn't seem to return token in login response seen in app.js? 
            // Let's re-verify app.js login flow.
            await AsyncStorage.setItem('userInfo', JSON.stringify(user));
            await AsyncStorage.setItem('userRole', user.role);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const getStudents = async (familyId = null) => {
    try {
        const url = familyId ? `/students?family_id=${familyId}` : '/students';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getMedicalRecord = async (studentId) => {
    try {
        const response = await api.get(`/medical/${studentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getPayments = async (studentId) => {
    try {
        const response = await api.get(`/payments/${studentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getGrades = async (studentId) => {
    try {
        const response = await api.get(`/students/${studentId}/grades`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getTasks = async (studentId) => {
    try {
        const response = await api.get(`/students/${studentId}/tasks`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getNotifications = async (userId) => {
    try {
        // Updated to match new backend endpoint
        const response = await api.get(`/notifications/my-notifications?userId=${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const markNotificationRead = async (id) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getSchoolInfo = async () => {
    try {
        const response = await api.get('/school-info');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getStudentProfile = async (id) => {
    try {
        const response = await api.get(`/students/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getConcepts = async () => {
    try {
        const response = await api.get('/concepts');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const generateCodiQr = async (data) => {
    try {
        // data should be { amount, concept, student_id, items: [...] }
        const response = await api.post('/payments/codi/qr', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const sendCodiRequest = async (data) => {
    try {
        const response = await api.post('/payments/codi/request', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export default api;
