import EmergencyModal from '@/components/EmergencyModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { supabase } from '@/utils/supabase';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Buffer } from 'buffer';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

global.Buffer = global.Buffer || Buffer;

// Initialize Sentry
Sentry.init({
  dsn: "https://1a585904c3413d59f72cbcfc4dc6f005@o4511182597521408.ingest.de.sentry.io/4511205901860944",
  // Enable logs to be sent to Sentry
  enableLogs: true,
  debug: false, // Set to true to see Sentry debug logs
});

// Configure how notifications are handled when the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const tokenCache = {
  async getToken(key: string) {
    try { return SecureStore.getItemAsync(key); } catch (err) { return null; }
  },
  async saveToken(key: string, value: string) {
    try { return SecureStore.setItemAsync(key, value); } catch (err) { return; }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return null;
}

// MAIN LAYOUT COMPONENT
function RootLayoutContent() {
  const { colorScheme } = useAppTheme();
  const { activeIncident, triggerEmergency, dismissEmergency } = useAdmin();
  const { isAuthenticated, user } = useAdminAuth();

  // Test Sentry logs
  useEffect(() => {
    // Send different log levels
    Sentry.logger.info('This is an info log');

    Sentry.logger.warn('This is a warning log', {
      log_type: 'test',
    });

    Sentry.logger.error('This is an error log');

    // Using formatted messages with dynamic values
    const testUser = 'john_doe';
    const action = 'login';
    Sentry.logger.info(
      Sentry.logger.fmt`User '${testUser}' performed '${action}'`
    );
  }, []);

  // --- PUSH NOTIFICATION SETUP (SAFE VERSION) ---
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!isAuthenticated || !user) return;

      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('emergency-alerts', {
            name: 'Emergency Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus === 'granted') {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
          if (projectId) {
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('🚀 Push Token Updated:', token);
            await supabase
              .from('profiles')
              .update({ push_token: token })
              .eq('email', user.primaryEmailAddress?.emailAddress);
          }
        }
      } catch (err: any) {
        console.warn('Notification setup skipped:', err.message);
      }
    }

    registerForPushNotificationsAsync();
  }, [isAuthenticated, user]);

  // --- REAL-TIME & ALARM CHECK ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkActive = async () => {
      const { data } = await supabase.from('incidents').select('*').eq('status', 'Active').limit(1);
      if (data?.[0]) {
        const { data: dev } = await supabase.from('devices').select('house_name, label').eq('mac', data[0].device_mac).single();
        triggerEmergency({
          id: data[0].id,
          house_name: dev?.house_name || 'Unknown',
          label: dev?.label || 'Unknown',
          ppm: data[0].ppm_at_trigger,
          alert_type: data[0].alert_type,
          device_mac: data[0].device_mac,
        });
      }
    };
    checkActive();

    const channel = supabase.channel('global-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, async (payload) => {
      if (payload.new.status !== 'Active') return;
      const { data: dev } = await supabase.from('devices').select('house_name, label').eq('mac', payload.new.device_mac).single();
      triggerEmergency({
        id: payload.new.id,
        house_name: dev?.house_name || 'Unknown',
        label: dev?.label || 'Unknown',
        ppm: payload.new.ppm_at_trigger,
        alert_type: payload.new.alert_type,
        device_mac: payload.new.device_mac,
      });
    }).subscribe();

    return () => { channel.unsubscribe(); };
  }, [isAuthenticated]);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProtectedLayout />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <EmergencyModal
        visible={!!activeIncident}
        incident={activeIncident}
        onClose={dismissEmergency}
        isAdmin={true}
      />
    </NavigationThemeProvider>
  );
}

// DEFAULT EXPORT (Wrapped with Sentry)
function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <SafeAreaProvider>
          <ErrorBoundary>
            <ThemeProvider>
              <AdminAuthProvider>
                <AdminProvider>
                  <RootLayoutContent />
                </AdminProvider>
              </AdminAuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
