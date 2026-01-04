import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications, markNotificationRead } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);

    useEffect(() => {
        loadUserAndNotifications();
    }, []);

    const loadUserAndNotifications = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                await fetchNotifications(parsedUser.id);
            } else {
                Alert.alert('Error', 'No se encontró información del usuario');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchNotifications = async (userId) => {
        try {
            const data = await getNotifications(userId);
            setNotifications(data || []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (item) => {
        setSelectedNotif(item);
        setModalVisible(true);

        if (!item.is_read) {
            try {
                await markNotificationRead(item.id);
                // Update local state to reflect read status
                setNotifications(prev => prev.map(n =>
                    n.id === item.id ? { ...n, is_read: 1 } : n
                ));
                // Allow UI to update
                item.is_read = 1;
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    const getCategoryStyles = (category) => {
        // Defaults (GENERAL)
        let styles = {
            headerBg: '#f1f5f9', headerText: '#334155', badgeBg: '#94a3b8', badgeText: '#1e293b', targetText: 'GENÉRICO'
        };

        if (category) {
            const catUpper = category.toUpperCase();

            if (catUpper.startsWith('LEVEL:')) {
                const level = catUpper.split(':')[1];
                styles.targetText = level;
                if (level.includes('PREESCOLAR')) {
                    styles = { headerBg: '#fef9c3', headerText: '#854d0e', badgeBg: '#facc15', badgeText: '#713f12', targetText: level };
                } else if (level.includes('PRIMARIA')) {
                    styles = { headerBg: '#dcfce7', headerText: '#166534', badgeBg: '#4ade80', badgeText: '#14532d', targetText: level };
                } else if (level.includes('SECUNDARIA')) {
                    styles = { headerBg: '#f3e8ff', headerText: '#6b21a8', badgeBg: '#c084fc', badgeText: '#581c87', targetText: level };
                }
            } else if (catUpper.startsWith('GROUP:')) {
                styles = { headerBg: '#e0f2fe', headerText: '#075985', badgeBg: '#38bdf8', badgeText: '#0c4a6e', targetText: 'GRUPO ' + catUpper.split(':')[1] };
            } else if (catUpper.includes('STUDENT:')) {
                // Extract Name from ORIGINAL string to preserve casing
                // Split by first colon
                const splitIndex = category.indexOf(':');
                if (splitIndex !== -1) {
                    const name = category.substring(splitIndex + 1).trim();
                    styles = { headerBg: '#e0e7ff', headerText: '#3730a3', badgeBg: '#818cf8', badgeText: '#312e81', targetText: name };
                }
            } else if (catUpper === 'PERSONAL') {
                styles = { headerBg: '#fee2e2', headerText: '#991b1b', badgeBg: '#f87171', badgeText: '#7f1d1d', targetText: 'PERSONAL' };
            }
        }
        return styles;
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderItem = ({ item }) => {
        const catStyles = getCategoryStyles(item.category);
        return (
            <TouchableOpacity
                style={[styles.card, !item.is_read && styles.unreadCard]}
                onPress={() => openDetail(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.typeIndicator, { backgroundColor: catStyles.badgeBg }]} />
                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <View style={{ backgroundColor: catStyles.badgeBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: catStyles.badgeText, textTransform: 'uppercase' }}>
                                        {catStyles.targetText}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                        </View>
                        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.message}>{item.message}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e31e25" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tienes notificaciones.</Text>
                    </View>
                }
            />

            {/* Notification Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedNotif && (() => {
                            const catStyles = getCategoryStyles(selectedNotif.category);
                            return (
                                <>
                                    <View style={[styles.modalHeader, { backgroundColor: catStyles.headerBg, borderColor: catStyles.headerBg }]}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ alignSelf: 'flex-start', backgroundColor: catStyles.badgeBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 }}>
                                                <Text style={{ fontSize: 11, fontWeight: '800', color: catStyles.badgeText, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    DIRIGIDO A: {catStyles.targetText}
                                                </Text>
                                            </View>
                                            <Text style={[styles.modalTitle, { color: catStyles.headerText }]}>{selectedNotif.title}</Text>
                                            <Text style={styles.modalDate}>{formatDate(selectedNotif.created_at)}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                            <MaterialIcons name="close" size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView style={styles.modalBody}>
                                        <Text style={styles.modalMessage}>{selectedNotif.message}</Text>
                                    </ScrollView>
                                    <View style={styles.modalFooter}>
                                        <TouchableOpacity
                                            style={styles.modalBtn}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.modalBtnText}>Entendido</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            );
                        })()}
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
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadCard: {
        backgroundColor: '#ffffff',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    typeIndicator: {
        width: 6,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 15,
        paddingLeft: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        alignItems: 'flex-start'
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 2
    },
    unreadText: {
        fontWeight: 'bold',
        color: '#111827',
    },
    date: {
        fontSize: 11,
        color: '#9ca3af',
        marginLeft: 10,
        marginTop: 4
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: 'white',
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    modalHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 26
    },
    modalDate: {
        fontSize: 13,
        color: 'rgba(0,0,0,0.5)',
    },
    closeBtn: {
        padding: 4,
    },
    modalBody: {
        padding: 24,
    },
    modalMessage: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'flex-end',
        backgroundColor: '#f8fafc'
    },
    modalBtn: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    modalBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15
    }
});
