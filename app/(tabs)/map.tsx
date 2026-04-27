import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from '@/components/CommunityMap';
import { supabase } from '@/utils/supabase';
import { useAdmin, Device } from '@/context/AdminContext';
import { useAppTheme } from '@/context/ThemeContext';

const ACCENT = '#E53935';

function getMarkerColor(worstPpm: number, hasDevices: boolean): string {
  if (!hasDevices) return '#555';
  if (worstPpm > 1500) return ACCENT;
  if (worstPpm > 450) return '#FF9500';
  return '#34C759';
}

export default function AdminMapScreen() {
  const { allDevices, allProfiles, activeIncident } = useAdmin();
  const { colorScheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const isDark = colorScheme === 'dark';
  const lastIncidentId = useRef<string | number | null>(null);

  const profilesArray = useMemo(() => Object.values(allProfiles), [allProfiles]);
  const validProfiles = useMemo(() => profilesArray.filter(p => p.latitude && p.longitude), [profilesArray]);
  const unpinnedProfiles = useMemo(() => profilesArray.filter(p => !p.latitude || !p.longitude), [profilesArray]);

  // Tab bar height calculation
  const TAB_BAR_CONTENT_HEIGHT = 60;
  const bottomPadding = Math.max(insets.bottom, 15);
  const totalTabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomPadding;
  const floatingBottom = totalTabBarHeight + 16;

  useEffect(() => {
    if (activeIncident && activeIncident.id !== lastIncidentId.current) {
      lastIncidentId.current = activeIncident.id;
      
      const device = activeIncident.device_mac ? allDevices[activeIncident.device_mac] : null;
      const profile = device?.profile_id ? allProfiles[device.profile_id] : null;

      if (profile?.latitude && profile?.longitude) {
        mapRef.current?.animateToRegion({
          latitude: profile.latitude,
          longitude: profile.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    }
  }, [activeIncident, allProfiles, allDevices]);

  // Map profile -> worst PPM
  const profilePpm = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(allDevices).forEach(dev => {
      if (!dev.profile_id) return;
      if (!map[dev.profile_id] || dev.ppm > map[dev.profile_id]) {
        map[dev.profile_id] = dev.ppm;
      }
    });
    return map;
  }, [allDevices]);

  const initialRegion = validProfiles.length > 0 ? {
    latitude: validProfiles[0].latitude!,
    longitude: validProfiles[0].longitude!,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    latitude: 14.5995, longitude: 120.9842, latitudeDelta: 0.05, longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.brandText}>LIVE MAP</Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Community Overview</Text>
      </View>

      <MapView 
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map} 
        initialRegion={initialRegion} 
        mapType="standard"
        userInterfaceStyle={colorScheme}
      >
        {validProfiles.map(profile => {
          const worstPpm = profilePpm[profile.id] || 0;
          const hasDevices = worstPpm > 0;
          const color = getMarkerColor(worstPpm, hasDevices);
          const statusLabel = worstPpm > 1500 ? '🔥 FIRE'
            : worstPpm > 450 ? '⚠️ WARNING'
            : hasDevices ? '✅ SAFE' : '⚫ NO SIGNAL';

          return (
            <Marker
              key={profile.id}
              coordinate={{ latitude: profile.latitude!, longitude: profile.longitude! }}
              pinColor={color}
            >
              <View style={[styles.markerContainer, { borderColor: color }]}>
                <View style={[styles.markerDot, { backgroundColor: color }]}>
                  {worstPpm > 1500 && <Text style={styles.markerIcon}>🔥</Text>}
                  {worstPpm > 450 && worstPpm <= 1500 && <Text style={styles.markerIcon}>💨</Text>}
                  {worstPpm <= 450 && hasDevices && <Text style={styles.markerIcon}>✓</Text>}
                  {!hasDevices && <Text style={styles.markerIcon}>👤</Text>}
                </View>
              </View>
              <Callout style={styles.callout}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutName}>{profile.name}</Text>
                  <Text style={styles.calloutCommunity}>{profile.block_lot || profile.address || 'Resident'}</Text>
                  <Text style={[styles.calloutStatus, { color }]}>{statusLabel}</Text>
                  {hasDevices && (
                    <Text style={styles.calloutPpm}>{worstPpm} PPM (peak)</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Unpinned Banner */}
      {unpinnedProfiles.length > 0 && (
        <View style={[styles.unpinnedBanner, { top: insets.top + 60, backgroundColor: isDark ? 'rgba(255,149,0,0.15)' : 'rgba(255,255,255,0.9)' }]}>
          <Text style={styles.unpinnedText}>
            📍 {unpinnedProfiles.length} resident(s) have no GPS location set.{'\n'}
            <Text style={{ fontSize: 10, fontWeight: '500' }}>They will not appear on the map until pinned in the Resident App.</Text>
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={[
        styles.legend, 
        { bottom: floatingBottom },
        { backgroundColor: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.9)' }
      ]}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>FIRE</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>WARNING</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>SAFE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14, zIndex: 10 },
  brandText: { color: ACCENT, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  map: { flex: 1 },
  markerContainer: { borderWidth: 2, borderRadius: 22, overflow: 'hidden' },
  markerDot: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  markerIcon: { fontSize: 18 },
  callout: { width: 170 },
  calloutContent: { padding: 10 },
  calloutName: { fontWeight: '900', fontSize: 14, color: '#111', marginBottom: 2 },
  calloutCommunity: { fontSize: 11, color: '#888', marginBottom: 6 },
  calloutStatus: { fontWeight: '800', fontSize: 12, marginBottom: 3 },
  calloutPpm: { fontSize: 11, color: '#555' },
  unpinnedBanner: {
    position: 'absolute', right: 16, left: 16,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,149,0,0.3)',
    zIndex: 20,
  },
  unpinnedText: { color: '#FF9500', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  legend: {
    position: 'absolute', left: 16,
    borderRadius: 14, padding: 12, gap: 6, zIndex: 10,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 6 } }),
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '700' },
});
