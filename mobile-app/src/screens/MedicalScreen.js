import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getMedicalRecord } from '../services/api';

export default function MedicalScreen({ route, navigation }) {
    const { student } = route.params;
    const [medicalData, setMedicalData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicalData();
    }, []);

    const fetchMedicalData = async () => {
        try {
            const data = await getMedicalRecord(student.id);
            setMedicalData(data || {});
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar la ficha médica');
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ label, value, multiline = false }) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={[styles.value, multiline && styles.multiline]}>
                {value || 'No registrado'}
            </Text>
        </View>
    );

    const SectionHeader = ({ title }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const BooleanTag = ({ label, value, details }) => (
        <View style={styles.tagContainer}>
            <View style={[styles.tag, value ? styles.tagYes : styles.tagNo]}>
                <Text style={styles.tagText}>{label}: {value ? 'SÍ' : 'NO'}</Text>
            </View>
            {value && details ? <Text style={styles.tagDetails}>{details}</Text> : null}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
                <Text>Cargando ficha médica...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Ficha Médica</Text>
                <Text style={styles.studentName}>{student.name} {student.lastnameP}</Text>
            </View>

            <View style={styles.card}>
                <SectionHeader title="Datos Generales" />
                <View style={styles.gridRow}>
                    <InfoRow label="Tipo de Sangre" value={medicalData?.blood_type} />
                    <InfoRow label="Edad" value={medicalData?.birthdate ? calculateAge(medicalData.birthdate) + ' años' : 'N/A'} />
                </View>
                <View style={styles.gridRow}>
                    <InfoRow label="Peso" value={medicalData?.weight ? `${medicalData.weight} kg` : ''} />
                    <InfoRow label="Altura" value={medicalData?.height ? `${medicalData.height} cm` : ''} />
                </View>
            </View>

            <View style={styles.card}>
                <SectionHeader title="Condiciones Prioritarias" />
                <InfoRow label="Alergias" value={medicalData?.allergies} multiline />
                <InfoRow label="Condiciones Crónicas" value={medicalData?.medical_conditions} multiline />
            </View>

            <View style={styles.card}>
                <SectionHeader title="Historial Médico" />
                <BooleanTag
                    label="Cirugías"
                    value={medicalData?.has_surgeries === 1}
                    details={medicalData?.surgeries_comments}
                />
                <BooleanTag
                    label="Tratamientos/Medicamentos"
                    value={medicalData?.has_medications === 1}
                    details={medicalData?.medications}
                />
                <BooleanTag
                    label="Terapia Externa"
                    value={medicalData?.has_therapy === 1}
                    details={medicalData?.therapy_comments}
                />
            </View>

            <View style={styles.card}>
                <SectionHeader title="Contactos y Médicos" />
                <Text style={styles.subHeader}>Contacto de Emergencia</Text>
                <InfoRow label="Nombre" value={medicalData?.emergency_contact_name} />
                <InfoRow label="Teléfono" value={medicalData?.emergency_contact_phone} />

                <View style={styles.divider} />

                <Text style={styles.subHeader}>Médico de Cabecera</Text>
                <InfoRow label="Nombre" value={medicalData?.doctor_name} />
                <InfoRow label="Teléfono" value={medicalData?.doctor_phone} />
                <InfoRow label="Hospital/Cons" value={medicalData?.doctor_office} />
            </View>

            <View style={[styles.card, { marginBottom: 40 }]}>
                <SectionHeader title="Seguro Médico" />
                <InfoRow label="Aseguradora" value={medicalData?.insurance_company} />
                <InfoRow label="Póliza" value={medicalData?.insurance_policy} />
            </View>
        </ScrollView>
    );
}

const calculateAge = (birthdateString) => {
    if (!birthdateString) return '';
    const today = new Date();
    const birthDate = new Date(birthdateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

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
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    studentName: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
    },
    subHeader: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 10,
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 10,
    },
    row: {
        marginBottom: 8,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    multiline: {
        lineHeight: 22,
    },
    tagContainer: {
        marginBottom: 12,
    },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    tagYes: {
        backgroundColor: '#fee2e2',
    },
    tagNo: {
        backgroundColor: '#f1f5f9',
    },
    tagText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333'
    },
    tagDetails: {
        fontSize: 14,
        color: '#475569',
        paddingLeft: 4,
    }
});
