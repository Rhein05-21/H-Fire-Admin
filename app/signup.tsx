import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text, TouchableOpacity,
  View, TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#E53935';

export default function SignUpScreen() {
  const { signUp, verifySignUp } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await signUp(email, password);
    
    if (result.success) {
      setPendingVerification(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || 'Sign up failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await verifySignUp(fullCode);
    
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Verification failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/h-fire_logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          {pendingVerification ? "Verify Email" : "Create Account"}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
          {pendingVerification ? "Enter the 6-digit code sent to your email" : "Join the H-FIRE Admin Network"}
        </Text>
      </View>

      {!pendingVerification ? (
        <View style={styles.form}>
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
            <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>PASSWORD</Text>
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
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>VERIFICATION CODE</Text>
            <View style={styles.otpContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref!; }}
                  style={[styles.otpInput, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  subtitle: { fontSize: 16, marginTop: 8, lineHeight: 24, textAlign: 'center' },
  form: { gap: 20 },
  inputContainer: { gap: 8 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  input: {
    height: 56, borderRadius: 16, paddingHorizontal: 20,
    fontSize: 16, fontWeight: '600', borderWidth: 1,
  },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpInput: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 1,
    textAlign: 'center', fontSize: 20, fontWeight: '700',
  },
  errorText: { color: ACCENT, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  primaryBtn: {
    backgroundColor: ACCENT, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
