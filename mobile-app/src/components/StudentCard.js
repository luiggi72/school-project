import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentCard({ student, navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.studentName}>{student.name} {student.lastnameP} {student.lastnameM}</Text>
                    <Text style={styles.studentGrade}>{student.grade} {student.subgrade} - {student.group_name}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('StudentProfile', { student })}>
                    <Ionicons name="information-circle-outline" size={28} color="#e31e25" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.infoText}>ID: {student.unique_id || student.id || 'N/A'}</Text>
                {student.overdue_balance > 0 && (
                    <Text style={{ color: '#b91c1c', fontWeight: 'bold', marginTop: 4 }}>
                        Saldo Vencido: ${parseFloat(student.overdue_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setMenuVisible(!menuVisible)}
            >
                <Text style={styles.dropdownButtonText}>Opciones</Text>
                <Ionicons name={menuVisible ? "chevron-up" : "chevron-down"} size={20} color="#e31e25" />
            </TouchableOpacity>

            {menuVisible && (
                <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Medical', { student }); }}>
                        <Ionicons name="medkit-outline" size={20} color="#475569" />
                        <Text style={styles.menuItemText}>Ficha Médica</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Payments', { student }); }}>
                        <Ionicons name="card-outline" size={20} color="#475569" />
                        <Text style={styles.menuItemText}>Pagos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Grades', { student }); }}>
                        <Ionicons name="document-text-outline" size={20} color="#475569" />
                        <Text style={styles.menuItemText}>Boleta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Tasks', { student }); }}>
                        <Ionicons name="book-outline" size={20} color="#475569" />
                        <Text style={styles.menuItemText}>Tareas</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    cardBody: {
        marginBottom: 10,
    },
    infoText: {
        color: '#64748b',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    dropdownButtonText: {
        color: '#e31e25',
        fontWeight: '600',
    },
    menuList: {
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuItemText: {
        marginLeft: 10,
        color: '#334155',
        fontSize: 16,
    }
});
