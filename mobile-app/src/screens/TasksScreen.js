import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal } from 'react-native';
import { getTasks } from '../services/api';

export default function TasksScreen({ route, navigation }) {
    const { student } = route.params;
    const [allTasks, setAllTasks] = useState([]); // Store all fetched tasks
    const [filteredTasks, setFilteredTasks] = useState([]); // Store visible tasks
    const [loading, setLoading] = useState(true);

    // Date Filter State
    const [selectedDate, setSelectedDate] = useState('');
    const [availableDates, setAvailableDates] = useState([]);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        filterTasksByDate();
    }, [selectedDate, allTasks]);

    const fetchTasks = async () => {
        try {
            const data = await getTasks(student.id);
            const tasksData = data || [];

            // Sort by due_date ASC
            tasksData.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

            setAllTasks(tasksData);
            extractAvailableDates(tasksData);

            // Default Selection Logic:
            // 1. If today has tasks, select today.
            // 2. Else, select the next upcoming date with tasks.
            // 3. Else (only past tasks), select the last date (most recent in past).

            const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

            const hasToday = tasksData.some(t => t.due_date.startsWith(todayKey));

            if (hasToday) {
                setSelectedDate(todayKey);
            } else {
                // Find next upcoming
                const now = new Date();
                const upcoming = tasksData.find(t => new Date(t.due_date) >= now);

                if (upcoming) {
                    setSelectedDate(upcoming.due_date.slice(0, 10));
                } else if (tasksData.length > 0) {
                    // All in past? Show the last one (latest date)
                    const lastTask = tasksData[tasksData.length - 1]; // Since it is sorted ASC, last is latest
                    setSelectedDate(lastTask.due_date.slice(0, 10));
                } else {
                    setSelectedDate(todayKey);
                }
            }

        } catch (error) {
            console.error('Error fetching tasks:', error);
            Alert.alert('Error', `No se pudieron cargar las tareas. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const extractAvailableDates = (tasksData) => {
        const dates = new Set();
        tasksData.forEach(t => {
            if (t.due_date) {
                dates.add(t.due_date.slice(0, 10));
            }
        });
        // Sort dates ASC
        const sortedDates = Array.from(dates).sort((a, b) => a.localeCompare(b));
        setAvailableDates(sortedDates);
    };

    const filterTasksByDate = () => {
        if (!selectedDate) {
            setFilteredTasks(allTasks);
            return;
        }
        const filtered = allTasks.filter(t => t.due_date && t.due_date.startsWith(selectedDate));
        setFilteredTasks(filtered);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatDateLabel = (yyyy_mm_dd) => {
        if (!yyyy_mm_dd) return '';
        // Handle timezone/parsing carefully. We just want formatting.
        // Creating date with 'T00:00:00' ensures local interpretation doesn't shift day if strictly using date parts.
        // Actually best to split and construct to avoid timezone shifts.
        const [y, m, d] = yyyy_mm_dd.split('-');
        const date = new Date(y, parseInt(m) - 1, d);

        const str = date.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.subjectTag, { backgroundColor: getSubjectColor(item.subject) }]}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                <Text style={styles.dueDate}>Entrega: {formatDate(item.due_date)}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusDone : styles.statusPending]}>
                    <Text style={[styles.statusText, item.status === 'COMPLETED' ? styles.textDone : styles.textPending]}>
                        {item.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderDateItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.dateItem, item === selectedDate && styles.selectedDateItem]}
            onPress={() => {
                setSelectedDate(item);
                setDatePickerVisible(false);
            }}
        >
            <Text style={[styles.dateText, item === selectedDate && styles.selectedDateText]}>
                {formatDateLabel(item)}
            </Text>
            {item === selectedDate && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
    );

    const getSubjectColor = (subject) => {
        switch (subject) {
            case 'Matemáticas': return '#3b82f6';
            case 'Español': return '#f59e0b';
            case 'Ciencias': return '#10b981';
            case 'Historia': return '#8b5cf6';
            case 'Inglés': return '#ec4899';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
                <Text>Cargando tareas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Tareas y Deberes</Text>
                <Text style={styles.studentName}>{student.name} {student.lastnameP}</Text>
            </View>

            {/* Date Filter */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setDatePickerVisible(true)}
                >
                    <Text style={styles.filterLabel}>Fecha:</Text>
                    <Text style={styles.filterValue}>{formatDateLabel(selectedDate) || 'Seleccionar Fecha'}</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay tareas para esta fecha.</Text>
                    </View>
                }
            />

            {/* Date Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDatePickerVisible}
                onRequestClose={() => setDatePickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtrar por Fecha</Text>
                            <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={availableDates}
                            renderItem={renderDateItem}
                            keyExtractor={item => item}
                            style={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#e31e25',
        paddingBottom: 25,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    studentName: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
    },

    // Filter Styles
    filterContainer: {
        paddingHorizontal: 15,
        marginTop: 10,  // Match Payments style
        marginBottom: 10,
    },
    filterButton: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterLabel: {
        fontSize: 14,
        color: '#64748b',
        marginRight: 8,
    },
    filterValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#64748b',
    },

    list: {
        padding: 15,
        paddingTop: 5,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subjectTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    subjectText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dueDate: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 15,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusPending: {
        backgroundColor: '#fffbeb',
        borderColor: '#fcd34d',
    },
    statusDone: {
        backgroundColor: '#f0fdf4',
        borderColor: '#86efac',
    },
    textPending: {
        color: '#b45309',
    },
    textDone: {
        color: '#15803d',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },

    // Modal Styles (Copied from Payments)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    closeButton: {
        color: '#e31e25',
        fontSize: 16,
        fontWeight: '600',
    },
    modalList: {
        paddingBottom: 20,
    },
    dateItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedDateItem: {
        backgroundColor: '#fef2f2',
    },
    dateText: {
        fontSize: 16,
        color: '#334155',
    },
    selectedDateText: {
        color: '#e31e25',
        fontWeight: 'bold',
    },
    checkIcon: {
        color: '#e31e25',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
