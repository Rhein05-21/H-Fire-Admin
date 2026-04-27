import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Animated, Dimensions, Alert, Linking, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { IconSymbol } from './ui/icon-symbol';
import { supabase } from '@/utils/supabase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdmin } from '@/context/AdminContext';

const { width, height } = Dimensions.get('window');

interface EmergencyModalProps {
  visible: boolean;
  incident: {
    id: string | number;
    house_name: string;
    label: string;
    ppm: number;
    flame?: boolean;
    alert_type: 'FIRE' | 'GAS/SMOKE' | 'SMOKE' | 'FLAME' | 'MODERATE SMOKE';
    device_mac?: string;
  } | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function EmergencyModal({ visible, incident, onClose, isAdmin }: EmergencyModalProps) {
  const { role } = useAdminAuth();
  const { allDevices, allProfiles, allFamilyMembers } = useAdmin();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // REAL-TIME PPM LOOKUP
  const livePpm = useMemo(() => {
    if (!incident?.device_mac) return incident?.ppm || 0;
    const currentDevice = allDevices[incident.device_mac];
    return currentDevice ? currentDevice.ppm : incident.ppm;
  }, [allDevices, incident]);

  // CONTACT INFO LOOKUP
  const contacts = useMemo(() => {
    if (!incident?.device_mac) return null;
    const device = allDevices[incident.device_mac];
    const profileId = device?.profile_id;
    const profile = profileId ? allProfiles[profileId] : null;

    // 1. Household Primary Member
    const family = allFamilyMembers.filter(f => f.profile_id === profileId);
    const primary = family.find(f => f.is_primary) || family[0];

    // 2. Guard Lookup
    const guard = Object.values(allProfiles).find(p => 
      p.role === 'guard' || p.name?.toLowerCase().includes('guard')
    );

    // 3. Near Residents (Same Block/Lot or Community)
    const currentLoc = profile?.block_lot || device?.house_name;
    const neighbors = Object.values(allProfiles).filter(p => 
      p.id !== profileId && 
      p.role === 'resident' &&
      p.block_lot && 
      (p.block_lot === profile?.block_lot || p.address === profile?.address)
    ).slice(0, 3); // Top 3 nearby

    return {
      primary: { name: primary?.full_name || profile?.name || 'Resident', phone: primary?.phone || null },
      guard: { name: guard?.name || 'Security Guard', phone: guard?.emergency_hotline || guard?.phone || null },
      neighbors: neighbors,
      fireHotline: profile?.emergency_hotline || '+639XXXXXXXXX'
    };
  }, [incident, allDevices, allProfiles, allFamilyMembers]);

  const isFire = incident?.alert_type === 'FIRE' || incident?.alert_type === 'FLAME';
  const overlayColor = isFire ? 'rgba(183, 28, 28, 0.98)' : 'rgba(230, 81, 0, 0.98)';

  async function playSiren() {
    try {
      if (!incident) return;
      if (sound) { await sound.stopAsync(); await sound.unloadAsync(); }
      const soundFile = (incident.alert_type === 'FIRE' || incident.alert_type === 'FLAME')
        ? require('../assets/Fire Alarm.mp3')
        : require('../assets/Smoke Alarm Sound.mp3');
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true, isLooping: true, volume: 1.0 });
      setSound(newSound);
    } catch (e) {}
  }

  async function stopSiren() {
    if (sound) { await sound.stopAsync(); await sound.unloadAsync(); setSound(null); }
  }

  useEffect(() => {
    let vibrationInterval: any;
    if (visible) {
      playSiren();
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])).start();
      vibrationInterval = setInterval(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }, 1000);
    } else { stopSiren(); }
    return () => { if (vibrationInterval) clearInterval(vibrationInterval); stopSiren(); };
  }, [visible]);

  const handleCall = (phone: string, label: string) => {
    Alert.alert('Emergency Call', `Call ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) }
    ]);
  };

  if (!incident) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.alertCircle, { transform: [{ scale: pulseAnim }] }]}>
            <IconSymbol name={isFire ? "flame.fill" : "exclamationmark.triangle.fill"} size={60} color="#fff" />
          </Animated.View>

          <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
          <Text style={styles.houseName}>{incident.house_name}</Text>
          <Text style={styles.locationDetail}>{(incident.label || '').toUpperCase()}</Text>

          <View style={styles.ppmBadge}>
            <Text style={[styles.ppmValue, { color: isFire ? '#B71C1C' : '#E65100' }]}>
              {incident.flame ? 'FLAME' : `${livePpm} PPM`}
            </Text>
            <Text style={[styles.ppmLabel, { color: isFire ? '#B71C1C' : '#E65100' }]}>
              {incident.flame ? 'FIRE DETECTED' : 'GAS / SMOKE DETECTED'}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <Text style={styles.optionHeader}>RESPONDER OPTIONS</Text>
            
            <TouchableOpacity style={styles.mainCallBtn} onPress={() => handleCall(contacts?.fireHotline || '911', 'Fire Hotline')}>
              <IconSymbol name="phone.fill" size={20} color="#B71C1C" />
              <View>
                <Text style={[styles.callBtnText, { color: '#B71C1C' }]}>CALL FIRE HOTLINE</Text>
                <Text style={styles.callBtnSub}>Official Emergency Services</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.gridRow}>
              {contacts?.primary.phone && (
                <TouchableOpacity style={styles.gridBtn} onPress={() => handleCall(contacts.primary.phone!, contacts.primary.name)}>
                  <IconSymbol name="house.fill" size={18} color="#fff" />
                  <Text style={styles.gridBtnText}>HOUSEHOLD</Text>
                </TouchableOpacity>
              )}
              {contacts?.guard.phone && (
                <TouchableOpacity style={styles.gridBtn} onPress={() => handleCall(contacts.guard.phone!, 'Security Guard')}>
                  <IconSymbol name="checkmark.shield.fill" size={18} color="#fff" />
                  <Text style={styles.gridBtnText}>CALL GUARD</Text>
                </TouchableOpacity>
              )}
            </View>

            {contacts?.neighbors && contacts.neighbors.length > 0 && (
              <TouchableOpacity 
                style={[styles.mainCallBtn, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 10 }]} 
                onPress={() => {
                  const first = contacts.neighbors[0];
                  handleCall(first.phone || first.emergency_hotline || '', `Neighbor: ${first.name}`);
                }}
              >
                <IconSymbol name="person.2.fill" size={20} color="#fff" />
                <View>
                  <Text style={styles.callBtnText}>CALL NEAR RESIDENTS</Text>
                  <Text style={styles.callBtnSub}>{contacts.neighbors.length} neighbors in vicinity</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissBtnText}>DISMISS ALARM</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: 20 },
  scrollContent: { alignItems: 'center', paddingTop: 40, paddingBottom: 60 },
  alertCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emergencyTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 4, marginBottom: 10 },
  houseName: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  locationDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700', marginTop: 2 },
  ppmBadge: {
    backgroundColor: '#fff', paddingHorizontal: 25, paddingVertical: 12,
    borderRadius: 20, alignItems: 'center', marginTop: 25, marginBottom: 30, width: '80%'
  },
  ppmValue: { fontSize: 32, fontWeight: '900' },
  ppmLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  
  optionsContainer: { width: '100%', gap: 10 },
  optionHeader: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '900', textAlign: 'center', marginBottom: 5, letterSpacing: 1 },
  mainCallBtn: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 18,
    borderRadius: 18, alignItems: 'center', gap: 15,
  },
  callBtnText: { fontSize: 16, fontWeight: '900' },
  callBtnSub: { fontSize: 10, color: 'rgba(0,0,0,0.4)', fontWeight: '700' },
  gridRow: { flexDirection: 'row', gap: 10 },
  gridBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', padding: 18,
    borderRadius: 18, alignItems: 'center', gap: 8, justifyContent: 'center'
  },
  gridBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  dismissBtn: { marginTop: 30, padding: 15 },
  dismissBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
});
