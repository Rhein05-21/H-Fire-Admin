import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth, useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated, Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');
const ACCENT = '#E53935';
const HOA_ACCENT = '#1565C0';

export default function LoginScreen() {
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  const { signOut } = useAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });

  const onSelectAuth = useCallback(async () => {
    setLoading(true);
    setError('');
    console.log(`[OAuth] Starting google flow...`);
    
    try {
      const { createdSessionId, setActive } = await googleAuth({
        redirectUrl: Linking.createURL('/', { scheme: 'hfire-admin' })
      });

      if (createdSessionId) {
        console.log(`[OAuth] Session created: ${createdSessionId}. Setting active...`);
        await setActive!({ session: createdSessionId });
        
        console.log(`[OAuth] Success! Manually redirecting to dashboard...`);
        router.replace('/(tabs)');
      } else {
        console.log(`[OAuth] No session created (user might have cancelled).`);
      }
    } catch (err: any) {
      console.error('[OAuth] Error during flow:', err);
      setError(err.message || 'OAuth login failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [googleAuth, router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await login(email, password);
    
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
      return;
    }

    setLoading(false);
    setError(result.error || 'Login failed. Please try again.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.bgTop, { backgroundColor: isDark ? `${ACCENT}15` : `${ACCENT}08` }]} />
      <View style={[styles.bgBottom, { backgroundColor: isDark ? `${HOA_ACCENT}10` : `${HOA_ACCENT}05` }]} />

      <View style={styles.brandRow}>
        <Image 
          source={require('@/assets/images/h-fire_logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={[styles.brandTitle, { color: isDark ? '#fff' : '#000' }]}>H-FIRE</Text>
        <Text style={styles.brandSub}>ADMIN MONITORING CENTER</Text>
      </View>

      <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }]}>
        Sign in to your account to access the{'\n'}Command Center
      </Text>

      <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}
            placeholder="manager@hfire.com"
            placeholderTextColor={isDark ? '#444' : '#aaa'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>PASSWORD</Text>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={[styles.forgotText, { color: ACCENT }]}>FORGOT?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}
            placeholder="••••••••"
            placeholderTextColor={isDark ? '#444' : '#aaa'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={[styles.line, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
          <Text style={[styles.orText, { color: isDark ? '#666' : '#999' }]}>OR CONTINUE WITH</Text>
          <View style={[styles.line, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity 
            style={[styles.socialBtn, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}
            onPress={() => onSelectAuth()}
          >
            <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.socialBtnText, { color: isDark ? '#fff' : '#000' }]}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.hintRow}>
        <View style={[styles.hintBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Text style={[styles.hintText, { color: isDark ? '#888' : '#666' }]}>Authorized Access Only</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bgTop: {
    position: 'absolute', top: -100, left: -80, width: 350, height: 350,
    borderRadius: 175,
  },
  bgBottom: {
    position: 'absolute', bottom: -80, right: -80, width: 300, height: 300,
    borderRadius: 150,
  },
  brandRow: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 120, height: 120, marginBottom: 8 },
  brandTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 6 },
  brandSub: { color: ACCENT, fontSize: 11, fontWeight: '900', letterSpacing: 4, marginTop: 4 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 12, marginBottom: 36, lineHeight: 20 },
  form: { width: width * 0.85, gap: 20 },
  inputContainer: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  forgotText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  input: {
    height: 56, borderRadius: 16, paddingHorizontal: 20,
    fontSize: 16, fontWeight: '600', borderWidth: 1,
  },
  errorText: { color: ACCENT, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  loginBtn: {
    backgroundColor: ACCENT, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  line: { flex: 1, height: 1 },
  orText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1, height: 56, borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  socialBtnText: { fontSize: 14, fontWeight: '700' },
  signupLink: { alignItems: 'center', marginTop: 10 },
  signupText: { fontSize: 13, fontWeight: '600' },
  hintRow: { marginTop: 40 },
  hintBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  hintText: { fontSize: 11, fontWeight: '700' },
});
