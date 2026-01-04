import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar as RNStatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import StudentCard from '../components/StudentCard';
import { getStudents, getPayments, getConcepts, getNotifications } from '../services/api';

export default function HomeScreen({ navigation }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [menuVisible, setMenuVisible] = useState(false);

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const userJson = await AsyncStorage.getItem('userInfo');
            const user = JSON.parse(userJson);
            setCurrentUser(user);

            // Fetch students filtered by family_id if user is a tutor
            const allStudents = await getStudents(user.linked_family_id);

            // Calculate Overdue Balances
            const allConcepts = await getConcepts();
            const studentsWithOverdue = await Promise.all(allStudents.map(async (student) => {
                try {
                    const payments = await getPayments(student.id);
                    const overdue = calculateStudentOverdue(student, payments || [], allConcepts || []);
                    return { ...student, overdue_balance: overdue };
                } catch (e) {
                    console.error('Error calculating overdue for', student.id, e);
                    return student;
                }
            }));

            setStudents(studentsWithOverdue);

            // Fetch Notifications for Badge
            try {
                const notifications = await getNotifications(user.id);
                if (notifications) {
                    const count = notifications.filter(n => !n.is_read).length;
                    setUnreadCount(count);
                }
            } catch (e) {
                console.error('Error fetching notifications for home badge', e);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData(true);
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userInfo', 'userRole']);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error logout:', error);
        }
    };

    const renderStudent = ({ item }) => (
        <StudentCard student={item} navigation={navigation} />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={32} color="#1e293b" />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.greeting}>Hola, {currentUser?.profile || 'Usuario'}</Text>
                    <Text style={styles.subGreeting}>Mis Hijos</Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellButton}>
                    <Ionicons name="notifications-outline" size={30} color="#e31e25" />
                    {unreadCount > 0 && <View style={styles.notificationDot} />}
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#e31e25" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    renderItem={renderStudent}
                    keyExtractor={item => item.id.toString()}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.list, { paddingBottom: 100 }]} // Increased bottom padding
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e31e25']} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No se encontraron alumnos asociados.</Text>
                    }
                />
            )}

            {/* Hamburger Menu Overlay */}
            {menuVisible && (
                <View style={styles.overlayContainer}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        onPress={() => setMenuVisible(false)}
                        activeOpacity={1}
                    />
                    <View style={styles.menuPanel}>
                        <View style={styles.menuHeader}>
                            <Ionicons name="person-circle-outline" size={60} color="#e31e25" />
                            <Text style={styles.menuUserName}>{currentUser?.username || 'Usuario'}</Text>
                            <Text style={styles.menuUserEmail}>{currentUser?.email}</Text>
                        </View>

                        <View style={styles.menuItems}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                                <Ionicons name="home-outline" size={24} color="#475569" />
                                <Text style={styles.menuItemText}>Inicio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Notifications'); }}>
                                <Ionicons name="notifications-outline" size={24} color="#475569" />
                                <Text style={styles.menuItemText}>Notificaciones</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('SchoolInfo'); }}>
                                <Ionicons name="information-circle-outline" size={24} color="#475569" />
                                <Text style={styles.menuItemText}>Información del Colegio</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuFooter}>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={24} color="#e31e25" />
                                <Text style={styles.logoutText}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {/* Chatbot FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Chat')}
            >
                <Ionicons name="chatbubbles" size={30} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Logic shared with PaymentsScreen (Ideally should be a utility)
const calculateStudentOverdue = (student, allPayments, allConcepts) => {
    // 1. Find Tuition Concept
    const inferLevel = (s) => {
        const rawLevel = (s.educational_level || s.level || s.level_id || '').toUpperCase().trim();
        if (rawLevel && rawLevel.length > 2) return rawLevel;
        const grade = (s.grade || s.grado || '').toUpperCase().trim();
        if (grade.includes('KIN') || grade.includes('PRE') || grade.includes('KINDER')) return 'PREESCOLAR';
        if (grade.includes('PRI') || grade.includes('PRIM')) return 'PRIMARIA';
        if (grade.includes('SEC') || grade.includes('SECUNDARIA')) return 'SECUNDARIA';
        if (grade.includes('BAC') || grade.includes('PREP')) return 'BACHILLERATO';
        if (grade.includes('UNI') || grade.includes('LIC')) return 'LICENCIATURA';
        return rawLevel || grade || 'GENERAL';
    };

    const inferredLevel = inferLevel(student);
    const tuitionConcept = allConcepts.find(c => {
        const cLevel = (c.academic_level || '').toUpperCase().trim();
        const cName = (c.name || '').toUpperCase();
        return (cLevel === 'GENERAL' || cLevel === inferredLevel) &&
            (cName.includes('COLEGIATURA') || cName.includes('MENSUALIDAD'));
    });

    if (!tuitionConcept) return 0;

    // 2. Calculate Overdue
    let totalOverdue = 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();

    const monthMap = {
        'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5, 'Julio': 6
    };

    let cycleStartYear = currentYear;
    if (currentMonthIdx < 7) cycleStartYear = currentYear - 1;

    const schoolMonths = [
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'
    ];

    schoolMonths.forEach(month => {
        const mIdx = monthMap[month];
        let year = cycleStartYear;
        if (mIdx < 8) year = cycleStartYear + 1;

        const deadline = new Date(year, mIdx, 10, 23, 59, 59);

        if (now > deadline) {
            const isPaid = allPayments.some(p =>
                p.concept &&
                p.concept.toLowerCase().includes(month.toLowerCase()) &&
                (p.concept.toLowerCase().includes('colegiatura') || p.concept.toLowerCase().includes('mensualidad')) &&
                (p.codi_status === 'COMPLETED' || !p.codi_status)
            );

            if (!isPaid) {
                totalOverdue += parseFloat(tuitionConcept.default_amount);
            }
        }
    });

    return totalOverdue;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuButton: {
        padding: 5,
    },
    bellButton: {
        padding: 5,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 5,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e31e25',
    },
    greeting: {
        fontSize: 14,
        color: '#64748b',
    },
    subGreeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    list: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#e31e25',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    studentGrade: {
        fontSize: 14,
        color: '#e31e25',
        fontWeight: '600',
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    infoText: {
        color: '#64748b',
        marginBottom: 5,
    },
    cardFooter: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        padding: 5,
        width: '48%',
    },
    actionText: {
        color: '#e31e25',
        fontWeight: '500',
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
    // Menu Styles
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuPanel: {
        width: '75%',
        backgroundColor: 'white',
        height: '100%',
        padding: 20,
        paddingTop: 50,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'space-between',
    },
    menuHeader: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 20,
    },
    menuUserName: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    menuUserEmail: {
        fontSize: 14,
        color: '#64748b',
    },
    menuItems: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#334155',
        fontWeight: '500',
    },
    menuFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 8,
    },
    logoutText: {
        marginLeft: 10,
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        right: 20,
        bottom: 50, // Increased to avoid Android nav bar overlap
        backgroundColor: '#2563eb',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 100,
    }
});
