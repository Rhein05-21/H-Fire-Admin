import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/ThemeContext';

const ACCENT = '#E53935';
const HOA_ACCENT = '#1565C0';

export default function AdminSettings() {
  const { role, logout, user } = useAdminAuth();
  const { theme, setTheme, colorScheme } = useAppTheme();

  const isAdmin = role === 'admin';
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandText}>ADMIN SETTINGS</Text>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Configuration</Text>
        </View>

        {/* Minimal Role Badge */}
        <View style={[styles.roleCard, { 
          borderColor: isAdmin ? `${ACCENT}30` : `${HOA_ACCENT}30`,
          backgroundColor: isDark ? '#141414' : '#fff'
        }]}>
          <View style={[styles.roleIcon, { backgroundColor: isAdmin ? `${ACCENT}15` : `${HOA_ACCENT}15` }]}>
            <Text style={{ fontSize: 16 }}>{isAdmin ? '🔴' : '🔵'}</Text>
          </View>
          <View>
            <Text style={[styles.roleName, { color: isAdmin ? ACCENT : '#42A5F5' }]}>
              {isAdmin ? 'Administrator' : 'HOA Manager'}
            </Text>
            <Text style={[styles.userEmail, { color: isDark ? '#555' : '#888' }]}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Theme Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'auto'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themePill, 
                  { backgroundColor: isDark ? '#141414' : '#fff', borderColor: isDark ? '#222' : '#ddd' },
                  theme === t && styles.themePillActive
                ]}
                onPress={() => { setTheme(t); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.themePillText, theme === t && styles.themePillTextActive]}>
                  {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌑 Dark' : '⚙️ Auto'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info - Visible only to Admin */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APPLICATION</Text>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#141414' : '#fff' }]}>
              <View style={[styles.infoRow, { borderBottomColor: isDark ? '#1e1e1e' : '#eee' }]}>
                <Text style={styles.infoKey}>App</Text>
                <Text style={[styles.infoVal, { color: isDark ? '#aaa' : '#333' }]}>H-Fire Admin Console</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: isDark ? '#1e1e1e' : '#eee' }]}>
                <Text style={styles.infoKey}>User</Text>
                <Text style={[styles.infoVal, { color: isDark ? '#aaa' : '#333' }]}>{user?.fullName || 'N/A'}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: isDark ? '#1e1e1e' : '#eee' }]}>
                <Text style={styles.infoKey}>Supabase</Text>
                <Text style={[styles.infoVal, { color: isDark ? '#aaa' : '#333' }]}>Connected</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoKey}>Role</Text>
                <Text style={[styles.infoVal, { color: isAdmin ? ACCENT : '#42A5F5', fontWeight: '900' }]}>
                  {isAdmin ? 'Admin' : 'HOA Manager'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <IconSymbol name="arrow.left.square.fill" size={18} color={ACCENT} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 24, paddingBottom: 120 },
  header: { marginBottom: 24 },
  brandText: { color: ACCENT, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#141414', borderRadius: 12, padding: 10,
    marginBottom: 20, borderWidth: 1,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }, android: { elevation: 2 } }),
  },
  roleIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  roleName: { fontSize: 14, fontWeight: '900' },
  userEmail: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  section: { marginBottom: 28 },
  sectionTitle: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themePill: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#141414', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  themePillActive: { backgroundColor: `${ACCENT}20`, borderColor: ACCENT },
  themePillText: { color: '#555', fontWeight: '800', fontSize: 12 },
  themePillTextActive: { color: ACCENT },
  errorText: { color: ACCENT, fontWeight: '700', fontSize: 13 },
  successText: { color: '#34C759', fontWeight: '700', fontSize: 13 },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  infoCard: { backgroundColor: '#141414', borderRadius: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  infoKey: { color: '#555', fontWeight: '700', fontSize: 13 },
  infoVal: { color: '#aaa', fontWeight: '700', fontSize: 13 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, backgroundColor: `${ACCENT}15`, borderRadius: 18, borderWidth: 1, borderColor: `${ACCENT}30` },
  logoutText: { color: ACCENT, fontWeight: '900', fontSize: 16 },
});
