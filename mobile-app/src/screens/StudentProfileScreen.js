import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { getStudentProfile } from '../services/api';

export default function StudentProfileScreen({ route, navigation }) {
    const { student } = route.params; // Passed from navigation
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQr, setShowQr] = useState(false); // Default hidden

    useEffect(() => {
        if (student && student.id) {
            fetchProfile(student.id);
        }
    }, [student]);

    const fetchProfile = async (id) => {
        try {
            const data = await getStudentProfile(id);
            setProfile(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
            </View>
        );
    }

    const s = { ...student, ...(profile || {}) }; // Merge params with fetched profile (profile takes precedence but params fill gaps)
    const parents = s.parents || []; // Parents avail in profile

    console.log('Student Profile Data:', s);

    // ID to encode
    const qrValue = s.unique_id || s.id ? (s.unique_id || s.id).toString() : 'INVALID';

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={60} color="#fff" />
                </View>
                <Text style={styles.name}>{s.name} {s.lastnameP} {s.lastnameM}</Text>
                <Text style={styles.id}>ID: {s.unique_id || s.id || 'N/A'}</Text>
            </View>

            {/* Credencial Digital Section */}
            <View style={styles.qrSection}>
                <TouchableOpacity onPress={() => setShowQr(!showQr)} style={styles.qrHeader}>
                    <Ionicons name="qr-code-outline" size={24} color="#e31e25" />
                    <Text style={styles.qrTitle}>Credencial Digital</Text>
                    <Ionicons name={showQr ? "chevron-up" : "chevron-down"} size={24} color="#64748b" />
                </TouchableOpacity>

                {showQr && (
                    <View style={styles.qrContent}>
                        <View style={styles.qrCodeContainer}>
                            <QRCode
                                value={qrValue}
                                size={180}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>
                        <Text style={styles.qrFooter}>Escanea este código para acceso</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Académica</Text>

                <View style={styles.item}>
                    <Text style={styles.label}>Nivel Académico</Text>
                    <Text style={styles.value}>{s.grade || 'No registrado'}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Grado</Text>
                        <Text style={styles.value}>{s.subgrade || 'N/A'}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Grupo</Text>
                        <Text style={styles.value}>{s.group_name || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <View style={styles.item}>
                    <Text style={styles.label}>CURP</Text>
                    <Text style={styles.value}>{s.curp || 'No registrado'}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.label}>Fecha de Nacimiento</Text>
                    <Text style={styles.value}>{s.birthdate ? new Date(s.birthdate).toLocaleDateString() : 'No registrada'}</Text>
                </View>
            </View>

            {parents.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Familiares / Tutores</Text>
                    {parents.map((p, index) => (
                        <View key={index} style={styles.parentCard}>
                            <View style={styles.parentHeader}>
                                <Ionicons name="people-outline" size={20} color="#e31e25" />
                                <Text style={styles.parentName}>{p.name} {p.lastnameP} {p.lastnameM}</Text>
                            </View>
                            <Text style={styles.parentRelation}>{p.type === 'FATHER' ? 'Padre' : p.type === 'MOTHER' ? 'Madre' : 'Tutor'}</Text>
                            {p.phone && <Text style={styles.contactInfo}>Tel: {p.phone}</Text>}
                            {p.email && <Text style={styles.contactInfo}>{p.email}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
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
        backgroundColor: '#e31e25',
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 5,
    },
    id: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    // QR Styles
    qrSection: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
        overflow: 'hidden', // Contain content
    },
    qrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
    },
    qrTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
        marginLeft: 10,
    },
    qrContent: {
        alignItems: 'center',
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    qrCodeContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    qrFooter: {
        marginTop: 15,
        color: '#64748b',
        fontSize: 14,
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginTop: 20,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col: {
        flex: 1,
    },
    item: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    parentCard: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    parentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    parentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginLeft: 8,
    },
    parentRelation: {
        fontSize: 12,
        color: '#e31e25',
        fontWeight: '600',
        marginBottom: 5,
        marginLeft: 28, // align with name
    },
    contactInfo: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 28,
        marginBottom: 2,
    }
});
