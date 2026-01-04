import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, Alert } from 'react-native';
import { getGrades } from '../services/api';

export default function GradesScreen({ route, navigation }) {
    const { student } = route.params;
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const data = await getGrades(student.id);
            const formatted = processGrades(data);
            setSections(formatted);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudieron cargar las calificaciones');
        } finally {
            setLoading(false);
        }
    };

    const processGrades = (data) => {
        if (!data || data.length === 0) return [];

        // Group by period
        const groups = data.reduce((acc, curr) => {
            const period = curr.period || 'General';
            if (!acc[period]) {
                acc[period] = [];
            }
            acc[period].push(curr);
            return acc;
        }, {});

        // Convert to SectionList format
        return Object.keys(groups).map(period => ({
            title: period,
            data: groups[period]
        }));
    };

    const getScoreColor = (score) => {
        const val = parseFloat(score);
        if (val >= 9) return '#15803d'; // Green
        if (val >= 7) return '#d97706'; // Orange/Yellow
        return '#dc2626'; // Red
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.subject}>{item.subject}</Text>
            <View style={styles.scoreBadge}>
                <Text style={[styles.score, { color: getScoreColor(item.score) }]}>
                    {item.score}
                </Text>
            </View>
        </View>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
                <Text>Cargando boleta...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Boleta de Calificaciones</Text>
                <Text style={styles.studentName}>{student.name} {student.lastnameP}</Text>
                <Text style={styles.termInfo}>Ciclo Escolar Actual</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item, index) => item.id.toString() + index}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay calificaciones registradas.</Text>
                    </View>
                }
                stickySectionHeadersEnabled={false}
            />
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
    termInfo: {
        marginTop: 5,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    list: {
        padding: 15,
        paddingBottom: 30,
    },
    sectionHeader: {
        backgroundColor: '#e2e8f0',
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#475569',
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 8,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    subject: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
        flex: 1,
    },
    scoreBadge: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    }
});
