import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSchoolInfo } from '../services/api';

export default function SchoolInfoScreen({ navigation }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        try {
            const data = await getSchoolInfo();
            setInfo(data);
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

    // Defensive handling of field names due to schema uncertainty
    const name = info?.commercial_name || info?.name || 'Nombre de la Escuela';
    const address = info?.street
        ? `${info.street} ${info.exterior_number || ''}, ${info.neighborhood || ''}, ${info.city || ''}`
        : (info?.address || 'Dirección no disponible');
    const phone = info?.phone || info?.phones || 'No disponible';
    const email = info?.email || 'contacto@escuela.com'; // Fallback if missing

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="school-outline" size={60} color="#e31e25" />
                </View>
                <Text style={styles.schoolName}>{name}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.item}>
                    <Ionicons name="location-outline" size={24} color="#64748b" style={styles.icon} />
                    <View style={styles.itemContent}>
                        <Text style={styles.label}>Dirección</Text>
                        <Text style={styles.value}>{address}</Text>
                        {info?.zip_code && <Text style={styles.value}>CP: {info.zip_code}</Text>}
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <Ionicons name="call-outline" size={24} color="#64748b" style={styles.icon} />
                    <View style={styles.itemContent}>
                        <Text style={styles.label}>Teléfono</Text>
                        <Text style={styles.value}>{phone}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <Ionicons name="mail-outline" size={24} color="#64748b" style={styles.icon} />
                    <View style={styles.itemContent}>
                        <Text style={styles.label}>Email de Contacto</Text>
                        <Text style={styles.value}>{email}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <Ionicons name="time-outline" size={24} color="#64748b" style={styles.icon} />
                    <View style={styles.itemContent}>
                        <Text style={styles.label}>Horario de Atención</Text>
                        <Text style={styles.value}>Lunes a Viernes: 7:00 AM - 3:00 PM</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Plataforma Escolar</Text>
            </View>
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
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    schoolName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 20,
    },
    item: {
        flexDirection: 'row',
        paddingVertical: 20,
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: 20,
        marginTop: 2,
    },
    itemContent: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 44, // Align with text
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    footerText: {
        color: '#cbd5e1',
        fontSize: 12,
    }
});
