import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from '@/components/CommunityMap';
import { supabase } from '@/utils/supabase';
import { useAdmin, Device } from '@/context/AdminContext';
import { useAppTheme } from '@/context/ThemeContext';

const ACCENT = '#E53935';

interface ProfileLocation {
  id: string;
  name: string;
  community: string | null;
  latitude: number | null;
  longitude: number | null;
}

function getMarkerColor(worstPpm: number, hasDevices: boolean): string {
  if (!hasDevices) return '#555';
  if (worstPpm > 1500) return ACCENT;
  if (worstPpm > 450) return '#FF9500';
  return '#34C759';
}

export default function AdminMapScreen() {
  const { allDevices, activeIncident } = useAdmin();
  const { colorScheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const isDark = colorScheme === 'dark';
  const [profiles, setProfiles] = useState<ProfileLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const lastIncidentId = useRef<string | number | null>(null);

  // Tab bar height calculation logic (must match _layout.tsx)
  const TAB_BAR_CONTENT_HEIGHT = 60;
  const bottomPadding = Math.max(insets.bottom, 15);
  const totalTabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomPadding;
  const floatingBottom = totalTabBarHeight + 16;

  // Auto-locate active incident
  useEffect(() => {
    if (activeIncident && activeIncident.id !== lastIncidentId.current) {
      lastIncidentId.current = activeIncident.id;
      
      // Find coordinates for the incident's device/profile
      const device = activeIncident.device_mac ? allDevices[activeIncident.device_mac] : null;
      const profileId = device?.profile_id;
      const profile = profiles.find(p => p.id === profileId);

      if (profile?.latitude && profile?.longitude) {
        mapRef.current?.animateToRegion({
          latitude: profile.latitude,
          longitude: profile.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    }
  }, [activeIncident, profiles, allDevices]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, community, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();

    // Realtime: update if a profile's location changes
    const ch = supabase.channel('map-profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        const p = payload.new as ProfileLocation;
        setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x));
      })
      .subscribe();
    return () => { ch.unsubscribe(); };
  }, []);

  // Map profile -> worst PPM among their devices
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

  const validProfiles = profiles.filter(p => p.latitude && p.longitude);

  const initialRegion = validProfiles.length > 0 ? {
    latitude: validProfiles[0].latitude!,
    longitude: validProfiles[0].longitude!,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    latitude: 14.5995, longitude: 120.9842, latitudeDelta: 0.05, longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={[styles.loadingText, { color: isDark ? '#555' : '#888' }]}>Loading community map...</Text>
      </View>
    );
  }

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
                  {!hasDevices && <Text style={styles.markerIcon}>?</Text>}
                </View>
              </View>
              <Callout style={styles.callout}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutName}>{profile.name}</Text>
                  <Text style={styles.calloutCommunity}>{profile.community || 'Community'}</Text>
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

      {/* Legend */}
      <View style={[
        styles.legend, 
        { bottom: floatingBottom },
        { backgroundColor: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.9)' }
      ]}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>FIRE ({'>'}1500 PPM)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>WARNING ({'>'}450 PPM)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#ccc' : '#444' }]}>SAFE</Text>
        </View>
      </View>

      {validProfiles.length === 0 && (
        <View style={[
          styles.noLocations, 
          { bottom: floatingBottom },
          { backgroundColor: isDark ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.95)' }
        ]}>
          <Text style={[styles.noLocationsText, { color: isDark ? '#888' : '#666' }]}>
            ⚠️ No household locations found in database.{'\n'}
            Residents must set their home location in the H-Fire app.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#555', marginTop: 16, fontWeight: '700' },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 },
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
  legend: {
    position: 'absolute', bottom: 100, left: 16,
    backgroundColor: 'rgba(10,10,10,0.85)', borderRadius: 14,
    padding: 12, gap: 6,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 6 } }),
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#ccc', fontSize: 11, fontWeight: '700' },
  noLocations: {
    position: 'absolute', bottom: 100, right: 16, left: 16,
    backgroundColor: 'rgba(10,10,10,0.9)', borderRadius: 14, padding: 16,
  },
  noLocationsText: { color: '#888', fontSize: 12, lineHeight: 20, textAlign: 'center' },
});
