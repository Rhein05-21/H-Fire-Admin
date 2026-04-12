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

export default function ForgotPasswordScreen() {
  const { prepareResetPassword, completeResetPassword } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await prepareResetPassword(email);
    
    if (result.success) {
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || 'Failed to send code.');
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

  const handleResetPassword = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6 || !newPassword) {
      setError('Please enter both the full code and your new password.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await completeResetPassword(fullCode, newPassword);
    
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/login');
    } else {
      setError(result.error || 'Reset failed.');
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
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>
          {step === 1 ? "Enter your email to receive a reset code" : "Enter the 6-digit code and your new password"}
        </Text>
      </View>

      {step === 1 ? (
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Send Code</Text>
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>NEW PASSWORD</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }]}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#444' : '#aaa'}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Reset Password</Text>
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
