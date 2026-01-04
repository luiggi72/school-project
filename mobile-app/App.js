import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
// Remove or duplicate imports as needed based on file context, ensuring clean replacement:
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added import

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MedicalScreen from './src/screens/MedicalScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import GradesScreen from './src/screens/GradesScreen';
import TasksScreen from './src/screens/TasksScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SchoolInfoScreen from './src/screens/SchoolInfoScreen';
import StudentProfileScreen from './src/screens/StudentProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import API_URL from './src/config/api'; // Import our API_URL

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginState();
    registerForPushNotificationsAsync();
  }, []);

  const checkLoginState = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');

      if (userToken && userInfo) {
        setInitialRoute('Home');
        // If logged in, ensure we send the token (in case it changed or wasn't sent)
        const user = JSON.parse(userInfo);
        registerForPushNotificationsAsync(user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotificationsAsync = async (userId = null) => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('school-alerts-v2', {
        name: 'Notificaciones Escolares',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      // Simulator
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get the token
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;

      console.log('Expo Push Token:', pushTokenString);

      // Store internally if needed
      await AsyncStorage.setItem('expoPushToken', pushTokenString);

      // Send to Server
      if (userId) {
        await sendTokenToServer(userId, pushTokenString);
      } else {
        // If no userId yet, check async storage
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          await sendTokenToServer(user.id, pushTokenString);
        }
      }
    } catch (e) {
      console.error('Error getting push token', e);
    }
  };

  const sendTokenToServer = async (userId, token) => {
    try {
      await fetch(`${API_URL}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, token }),
      });
      console.log('Token sent to server for user:', userId);
    } catch (error) {
      console.error('Failed to send token to server', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e31e25" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['bottom', 'left', 'right']}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="white" />
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: true, title: 'Notificaciones', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="SchoolInfo"
              component={SchoolInfoScreen}
              options={{ headerShown: true, title: 'Información', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="StudentProfile"
              component={StudentProfileScreen}
              options={{ headerShown: true, title: 'Perfil del Alumno', headerTintColor: '#e31e25', headerStyle: { backgroundColor: '#f3f4f6' } }}
            />
            <Stack.Screen
              name="Medical"
              component={MedicalScreen}
              options={{ headerShown: true, title: 'Salud', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="Payments"
              component={PaymentsScreen}
              options={{ headerShown: true, title: 'Pagos', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="Grades"
              component={GradesScreen}
              options={{ headerShown: true, title: 'Boleta', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="Tasks"
              component={TasksScreen}
              options={{ headerShown: true, title: 'Tareas', headerTintColor: '#e31e25' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);


