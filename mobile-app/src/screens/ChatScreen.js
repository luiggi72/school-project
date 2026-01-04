import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios'; // We'll use the configured instance in next step or direct
import { API_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Assuming api.js exports the base URL, but we might need the auth interceptor.
// Let's use a local fetch wrapper or import the service if available.
// For now, I'll use axios directly with the imported URL.

export default function ChatScreen({ navigation }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy el asistente virtual del colegio. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef();

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = { role: 'user', content: inputText.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepare history (last 10 messages for context)
            const history = messages.slice(-10);

            // Get Token if needed (though chat might be public, but usually requires auth)
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.post(`${API_URL}/chat`, {
                message: userMessage.content,
                history: history
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botMessage = { role: 'assistant', content: response.data.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Lo siento, tuve un problema al conectar con el servidor. Por favor intenta de nuevo.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.botBubble
            ]}>
                <Text style={[
                    styles.text,
                    isUser ? styles.userText : styles.botText
                ]}>{item.content}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Regresar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asistente Virtual</Text>
                <View style={{ width: 60 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={10}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Escribe tu pregunta..."
                        placeholderTextColor="#9ca3af"
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, isLoading && styles.disabledButton]}
                        onPress={sendMessage}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>Enviar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#2563eb',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2563eb',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    botText: {
        color: '#1f2937',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
        color: '#1f2937',
    },
    sendButton: {
        backgroundColor: '#2563eb',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#93c5fd',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14, // Or use an icon
    },
});
