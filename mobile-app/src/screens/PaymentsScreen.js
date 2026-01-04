import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput, Image, ScrollView } from 'react-native';
import { getPayments, getConcepts, generateCodiQr, sendCodiRequest, getStudentProfile } from '../services/api';

export default function PaymentsScreen({ route, navigation }) {
    const { student } = route.params;

    // We fetch a fresh profile to ensure we have the correct academic level
    const [fullStudentProfile, setFullStudentProfile] = useState(student);

    const [allPayments, setAllPayments] = useState([]); // Store all fetched payments
    const [filteredPayments, setFilteredPayments] = useState([]); // Store currently visible payments
    const [loading, setLoading] = useState(true);

    // Month Selection State
    const [selectedMonth, setSelectedMonth] = useState('');
    const [availableMonths, setAvailableMonths] = useState([]);
    const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);

    // Payment Logic State
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    // We only care about the single "Colegiatura" concept for this student
    const [tuitionConcept, setTuitionConcept] = useState(null);
    const [selectedPaymentMonths, setSelectedPaymentMonths] = useState([]); // Changed to array
    const [concepts, setConcepts] = useState([]); // Needed for Debugging

    const [qrImage, setQrImage] = useState(null);
    const [generatingQr, setGeneratingQr] = useState(false);
    const [loadingConcepts, setLoadingConcepts] = useState(false);

    // CoDi Push State
    const [phoneNumber, setPhoneNumber] = useState('');

    // School Months Definition
    const schoolMonths = [
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'
    ];

    useEffect(() => {
        fetchPayments();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('Fetching latest profile for:', student.id);
            const profile = await getStudentProfile(student.id);
            if (profile) {
                // Determine if profile is array or object (API might vary)
                const s = Array.isArray(profile) ? profile[0] : profile;
                console.log('Profile fetched:', s);
                setFullStudentProfile(s);
            }
        } catch (e) {
            console.error('Error fetching profile:', e);
        }
    };

    useEffect(() => {
        if (paymentModalVisible) {
            fetchTuitionConcept();
            fetchPayments(); // Ensure we have latest history to mark months
        }
    }, [paymentModalVisible]);

    useEffect(() => {
        filterPaymentsByMonth();
    }, [selectedMonth, allPayments, tuitionConcept]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getPayments(student.id);
            const paymentsData = data || [];

            // Sort by date desc
            paymentsData.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

            setAllPayments(paymentsData);
            extractAvailableMonths(paymentsData);

            // Default to current month if available and NOT already selected
            if (!selectedMonth) {
                const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
                const hasCurrentMonth = paymentsData.some(p => p.payment_date.startsWith(currentMonthKey));
                if (hasCurrentMonth) {
                    setSelectedMonth(currentMonthKey);
                } else if (paymentsData.length > 0) {
                    setSelectedMonth(paymentsData[0].payment_date.slice(0, 7));
                } else {
                    setSelectedMonth(currentMonthKey);
                }
            } else {
                // Re-apply filter if we refreshed data 
                // (Strictly speaking useEffect dependency handles this, but forcing consistent state)
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar el historial de pagos');
        } finally {
            setLoading(false);
        }
    };

    const fetchTuitionConcept = async () => {
        setLoadingConcepts(true);
        try {
            const data = await getConcepts();

            // USE FULL PROFILE
            const s = fullStudentProfile || student;
            const inferredLevel = inferLevel(s);

            console.log('Inferred Level:', inferredLevel);

            const match = data.find(c => {
                const cLevel = (c.academic_level || '').toUpperCase().trim();
                const cName = (c.name || '').toUpperCase();

                // Check level match (flexible)
                const levelMatch = cLevel === 'GENERAL' || cLevel === inferredLevel;
                // Check it is a monthly fee
                const isTuition = cName.includes('COLEGIATURA') || cName.includes('MENSUALIDAD');

                return levelMatch && isTuition;
            });

            console.log('Matched Concept:', match);
            setTuitionConcept(match || null);
            setConcepts(data); // Store for debugging

            setSelectedPaymentMonths([]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar el costo de la colegiatura');
        } finally {
            setLoadingConcepts(false);
        }
    };

    const inferLevel = (s) => {
        const rawLevel = (s.educational_level || s.level || s.level_id || '').toUpperCase().trim();
        if (rawLevel && rawLevel.length > 2) return rawLevel; // Trust explicit level if present

        const grade = (s.grade || s.grado || '').toUpperCase().trim();
        if (grade.includes('KIN') || grade.includes('PRE') || grade.includes('KINDER')) return 'PREESCOLAR';
        if (grade.includes('PRI') || grade.includes('PRIM')) return 'PRIMARIA';
        if (grade.includes('SEC') || grade.includes('SECUNDARIA')) return 'SECUNDARIA';
        if (grade.includes('BAC') || grade.includes('PREP')) return 'BACHILLERATO';
        if (grade.includes('UNI') || grade.includes('LIC')) return 'LICENCIATURA';

        // Number fallback (risky but common)
        // Check local conventions. Often 1-6 Primaria, 1-3 Secundaria.
        // If simply '1', '2', '3' it's ambiguous unless we know context.
        // For now, return rawLevel/grade/NULL if no keyword match.

        return rawLevel || grade || 'GENERAL';
    };

    const handleSendRequest = async () => {
        if (selectedPaymentMonths.length === 0) {
            Alert.alert('Error', 'Selecciona al menos un mes a pagar.');
            return;
        }

        if (phoneNumber.length !== 10) {
            Alert.alert('Error', 'Ingresa un número celular válido (10 dígitos).');
            return;
        }

        setGeneratingQr(true);
        try {
            const conceptName = `${tuitionConcept.name} - ${selectedPaymentMonths.join(', ')}`;
            const amount = selectedPaymentMonths.length * parseFloat(tuitionConcept.default_amount);

            console.log(`Sending CoDi request for $${amount} to ${phoneNumber} - ${conceptName}`);

            const response = await sendCodiRequest(phoneNumber, amount, conceptName, student.id, selectedPaymentMonths);

            if (response && response.success) {
                setPaymentModalVisible(false);
                setQrModalVisible(true);
            } else {
                Alert.alert('Error', 'No se pudo enviar la solicitud de cobro.');
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Ocurrió un error al procesar la solicitud.');
        } finally {
            setGeneratingQr(false);
        }
    };

    const extractAvailableMonths = (paymentsData) => {
        const months = new Set();
        paymentsData.forEach(p => {
            if (p.payment_date) {
                months.add(p.payment_date.slice(0, 7)); // YYYY-MM
            }
        });
        // Sort months descending
        const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
        setAvailableMonths(sortedMonths);
    };

    const filterPaymentsByMonth = () => {
        if (!selectedMonth) {
            setFilteredPayments(allPayments);
            return;
        }
        const filtered = allPayments.filter(p => p.payment_date && p.payment_date.startsWith(selectedMonth));
        setFilteredPayments(filtered);
    };

    const formatMonthLabel = (yyyy_mm) => {
        if (!yyyy_mm) return '';
        const [year, month] = yyyy_mm.split('-');
        const date = new Date(year, parseInt(month) - 1);
        // Capitalize first letter
        const monthName = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderPaymentItem = ({ item }) => {
        // Determine status
        const isPaid = item.codi_status === 'COMPLETED' || !item.codi_status; // NULL codi_status implies manual payment = PAID
        const isPending = item.codi_status === 'PENDING';

        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.concept}>{item.concept}</Text>
                    <Text style={styles.amount}>${parseFloat(item.amount).toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.date}>{formatDate(item.payment_date)}</Text>
                    <View style={[styles.badge, isPaid ? styles.badgePaid : styles.badgePending]}>
                        <Text style={styles.badgeText}>
                            {item.payment_method || 'Manual'} ({isPaid ? 'Pagado' : item.codi_status})
                        </Text>
                    </View>
                </View>
            </View>

        );
    };

    const renderMonthItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.monthItem, item === selectedMonth && styles.selectedMonthItem]}
            onPress={() => {
                setSelectedMonth(item);
                setMonthPickerVisible(false);
            }}
        >
            <Text style={[styles.monthText, item === selectedMonth && styles.selectedMonthText]}>
                {formatMonthLabel(item)}
            </Text>
            {item === selectedMonth && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
    );

    if (loading && !allPayments.length) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
                <Text>Cargando pagos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.screenTitle}>Historial de Pagos</Text>
                    <Text style={styles.studentName}>{student.name} {student.lastnameP}</Text>
                </View>
                {/* Pay Button */}
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity style={styles.payButton} onPress={() => setPaymentModalVisible(true)}>
                        <Text style={styles.payButtonText}>Pagar CoDi</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Month Filter Button */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setMonthPickerVisible(true)}
                >
                    <Text style={styles.filterLabel}>Mes:</Text>
                    <Text style={styles.filterValue}>{formatMonthLabel(selectedMonth) || 'Seleccionar Mes'}</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredPayments}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshing={loading}
                onRefresh={fetchPayments}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay pagos registrados en este mes.</Text>
                    </View>
                }
            />

            {/* Month Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMonthPickerVisible}
                onRequestClose={() => setMonthPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtrar por Mes</Text>
                            <TouchableOpacity onPress={() => setMonthPickerVisible(false)}>
                                <Text style={styles.closeButton}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={availableMonths}
                            renderItem={renderMonthItem}
                            keyExtractor={item => item}
                            style={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>

            {/* Payment Concept Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={paymentModalVisible}
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pagar Colegiatura</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <Text style={styles.closeButton}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ padding: 20, flex: 1 }}>
                            {loadingConcepts ? (
                                <ActivityIndicator color="#e31e25" size="large" style={{ marginTop: 50 }} />
                            ) : !tuitionConcept ? (
                                <View style={{ alignItems: 'center', marginTop: 20 }}>
                                    <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 16, marginBottom: 10 }}>
                                        No se encontró un costo de colegiatura asignado para tu nivel.
                                    </Text>

                                    {/* DEBUG SECTION */}
                                    <ScrollView style={{ maxHeight: 200, width: '100%', backgroundColor: '#f1f5f9', padding: 10, borderRadius: 5 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#e31e25' }}>INFORMACIÓN DE DEPURACIÓN:</Text>
                                        <Text style={{ fontSize: 12 }}>ID Alumno: {student.id}</Text>
                                        <Text style={{ fontSize: 12 }}>Nivel (educational_level): {fullStudentProfile?.educational_level || 'NULL'}</Text>
                                        <Text style={{ fontSize: 12 }}>Nivel (level): {fullStudentProfile?.level || 'NULL'}</Text>
                                        <Text style={{ fontSize: 12 }}>Nivel (level_id): {fullStudentProfile?.level_id || 'NULL'}</Text>
                                        <Text style={{ fontSize: 12 }}>Grado: {fullStudentProfile?.grade || 'NULL'}</Text>

                                        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 12 }}>Conceptos Disponibles ({concepts.length}):</Text>
                                        {concepts.map(c => (
                                            <Text key={c.id} style={{ fontSize: 10 }}>
                                                - {c.name} [Nivel: {c.academic_level || 'Gen'}]
                                            </Text>
                                        ))}

                                        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 12 }}>Historial Reciente ({allPayments.length}):</Text>
                                        {allPayments.slice(0, 5).map(p => (
                                            <Text key={p.id} style={{ fontSize: 10 }}>
                                                - {p.concept} [{p.status || p.codi_status}]
                                            </Text>
                                        ))}
                                    </ScrollView>
                                </View>
                            ) : (
                                <>
                                    {/* Concept Info */}
                                    <View style={{ marginBottom: 20, backgroundColor: '#f8fafc', padding: 15, borderRadius: 10 }}>
                                        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 5 }}>Concepto Base</Text>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>{tuitionConcept.name}</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#15803d', marginTop: 5 }}>
                                            ${parseFloat(tuitionConcept.default_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Text>
                                    </View>

                                    {/* Month Selector */}
                                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#1e293b' }}>
                                        Selecciona el Mes a Pagar:
                                    </Text>

                                    <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        {schoolMonths.map((month) => {
                                            const paymentRecord = allPayments.find(p =>
                                                p.concept &&
                                                p.concept.toLowerCase().includes(month.toLowerCase()) &&
                                                (p.concept.toLowerCase().includes('colegiatura') || p.concept.toLowerCase().includes('mensualidad')) &&
                                                (p.codi_status !== 'FAILED' && p.codi_status !== 'EXPIRED')
                                            );

                                            // Fix: If codi_status is NULL, it's a manual payment -> COMPLETED/PAID
                                            const isPaid = paymentRecord && (paymentRecord.codi_status === 'COMPLETED' || !paymentRecord.codi_status);
                                            const isPending = paymentRecord && (!isPaid && paymentRecord.codi_status === 'PENDING');

                                            // Styles
                                            let bg = 'white';
                                            let border = '#e2e8f0';
                                            let text = '#64748b';
                                            let statusText = '';
                                            let borderWidth = 1;

                                            const isSelected = selectedPaymentMonths.includes(month);

                                            // Overdue Logic for Button Style
                                            const monthMap = {
                                                'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
                                                'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5, 'Julio': 6
                                            };
                                            const now = new Date();
                                            const currentYear = now.getFullYear();
                                            const currentMonthIdx = now.getMonth();
                                            let cycleStartYear = currentYear;
                                            if (currentMonthIdx < 7) cycleStartYear = currentYear - 1;

                                            const mIdx = monthMap[month];
                                            let year = cycleStartYear;
                                            if (mIdx < 8) year = cycleStartYear + 1;

                                            const deadline = new Date(year, mIdx, 10, 23, 59, 59);
                                            const isOverdue = !isPaid && !isPending && (now > deadline);

                                            // Priority: Paid > Pending > Selected > Overdue > Default
                                            if (isPaid) {
                                                bg = '#dcfce7'; // Green-100
                                                border = '#16a34a'; // Green-600
                                                text = '#166534'; // Green-800
                                                statusText = 'Pagado';
                                            } else if (isPending) {
                                                bg = '#fef9c3'; // Yellow-100
                                                border = '#ca8a04'; // Yellow-600
                                                text = '#854d0e'; // Yellow-800
                                                statusText = 'Pendiente';
                                            } else if (isSelected) {
                                                // Selected state takes precedence over Overdue warning
                                                // So user sees they have picked it
                                                bg = '#eff6ff'; // Blue-50
                                                border = '#3b82f6'; // Blue-500
                                                text = '#1e40af'; // Blue-800
                                                borderWidth = 2;
                                            } else if (isOverdue) {
                                                bg = '#fee2e2'; // Red-100
                                                border = '#ef4444'; // Red-500
                                                text = '#b91c1c'; // Red-700
                                                statusText = 'Vencido';
                                            }

                                            return (
                                                <TouchableOpacity
                                                    key={month}
                                                    disabled={isPaid || isPending}
                                                    style={{
                                                        width: '48%',
                                                        marginBottom: 10,
                                                        paddingVertical: 12,
                                                        borderRadius: 8,
                                                        borderWidth: borderWidth,
                                                        borderColor: border,
                                                        backgroundColor: bg,
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => {
                                                        setSelectedPaymentMonths(prev => {
                                                            if (prev.includes(month)) {
                                                                return prev.filter(m => m !== month);
                                                            } else {
                                                                return [...prev, month];
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <Text style={{
                                                        fontWeight: '600',
                                                        color: text
                                                    }}>
                                                        {month}
                                                    </Text>
                                                    {statusText ? (
                                                        <Text style={{ fontSize: 10, color: text, fontWeight: 'bold' }}>
                                                            {statusText}
                                                        </Text>
                                                    ) : null}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>

                                    {/* Phone Input */}
                                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10, color: '#1e293b' }}>
                                        Número Celular (10 dígitos):
                                    </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#cbd5e1',
                                            borderRadius: 10,
                                            padding: 15,
                                            fontSize: 18,
                                            marginBottom: 20,
                                            backgroundColor: 'white'
                                        }}
                                        placeholder="Ej. 8112345678"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                    />

                                    <View style={{ marginTop: 10 }}>
                                        <TouchableOpacity
                                            style={[styles.bigButton, (generatingQr || selectedPaymentMonths.length === 0 || phoneNumber.length !== 10) && { opacity: 0.5 }]}
                                            onPress={handleSendRequest}
                                            disabled={generatingQr || selectedPaymentMonths.length === 0 || phoneNumber.length !== 10}
                                        >
                                            {generatingQr ? <ActivityIndicator color="white" /> : (
                                                <Text style={styles.bigButtonText}>
                                                    {selectedPaymentMonths.length > 0
                                                        ? `Enviar Cobro $${(selectedPaymentMonths.length * parseFloat(tuitionConcept.default_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                        : 'Enviar Solicitud'
                                                    }
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success / Notification Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={qrModalVisible}
                onRequestClose={() => setQrModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { alignItems: 'center', padding: 30 }]}>

                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 40, color: '#0284c7' }}>📨</Text>
                        </View>

                        <Text style={[styles.modalTitle, { marginBottom: 10 }]}>¡Solicitud Enviada!</Text>

                        <Text style={{ textAlign: 'center', color: '#64748b', marginBottom: 20, fontSize: 16 }}>
                            Hemos enviado un cobro a <Text style={{ fontWeight: 'bold', color: '#334155' }}>{phoneNumber}</Text>.
                            {'\n'}Por favor autoriza el pago en tu app bancaria.
                        </Text>

                        <View style={{ backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, marginBottom: 30, width: '100%', alignItems: 'center' }}>
                            <Text style={{ color: '#64748b', marginBottom: 5 }}>Total a Pagar</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#15803d' }}>
                                ${(selectedPaymentMonths.length * parseFloat(tuitionConcept?.default_amount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.bigButton}
                            onPress={() => {
                                setQrModalVisible(false);
                                fetchPayments(); // Refresh list
                            }}
                        >
                            <Text style={styles.bigButtonText}>Listo, ya pagué</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

        </View >
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    studentName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    payButton: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2
    },
    payButtonText: {
        color: '#e31e25',
        fontWeight: 'bold'
    },
    overdueContainer: {
        marginTop: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignItems: 'flex-end'
    },
    overdueLabel: {
        color: '#fecaca', // Light Red
        fontSize: 10,
        fontWeight: '600'
    },
    overdueAmount: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    },
    // Filter Styles
    filterContainer: {
        paddingHorizontal: 15,
        marginTop: 10,
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
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    concept: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
        marginRight: 10,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#15803d',
    },
    date: {
        fontSize: 14,
        color: '#64748b',
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#f1f5f9',
    },
    badgePaid: {
        backgroundColor: '#dcfce7',
    },
    badgePending: {
        backgroundColor: '#fef9c3',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
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
    monthItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedMonthItem: {
        backgroundColor: '#fef2f2',
    },
    monthText: {
        fontSize: 16,
        color: '#334155',
    },
    selectedMonthText: {
        color: '#e31e25',
        fontWeight: 'bold',
    },
    checkIcon: {
        color: '#e31e25',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Payment UI Styles
    conceptItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedConceptItem: {
        backgroundColor: '#fef2f2',
        borderColor: '#e31e25',
        borderWidth: 1,
        borderRadius: 8
    },
    conceptName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#1e293b'
    },
    conceptLevel: {
        fontSize: 12,
        color: '#64748b'
    },
    conceptPrice: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#334155'
    },
    bigButton: {
        backgroundColor: '#e31e25',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    bigButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});
