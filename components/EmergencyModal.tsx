import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Animated, Dimensions, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { IconSymbol } from './ui/icon-symbol';
import { supabase } from '@/utils/supabase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdmin } from '@/context/AdminContext';

const { width } = Dimensions.get('window');

interface EmergencyModalProps {
  visible: boolean;
  incident: {
    id: string | number;
    house_name: string;
    label: string;
    ppm: number;
    flame?: boolean;
    alert_type: 'FIRE' | 'GAS/SMOKE';
    device_mac?: string;
  } | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function EmergencyModal({ visible, incident, onClose, isAdmin }: EmergencyModalProps) {
  const { role } = useAdminAuth ? useAdminAuth() : { role: null };
  const { allDevices } = useAdmin();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [dispatching, setDispatching] = useState(false);

  // REAL-TIME PPM LOOKUP
  const livePpm = useMemo(() => {
    if (!incident?.device_mac) return incident?.ppm || 0;
    const currentDevice = allDevices[incident.device_mac];
    return currentDevice ? currentDevice.ppm : incident.ppm;
  }, [allDevices, incident]);

  const isFire = incident?.alert_type === 'FIRE';
  const overlayColor = isFire ? 'rgba(183, 28, 28, 0.97)' : 'rgba(230, 81, 0, 0.97)';

  async function playSiren() {
    try {
      if (!incident) return;
      if (sound) { await sound.stopAsync(); await sound.unloadAsync(); }
      const soundFile = isFire
        ? require('../assets/Fire Alarm.mp3')
        : require('../assets/Smoke Alarm Sound.mp3');
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundFile,
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      setSound(newSound);
    } catch (e) { console.error('Siren failed:', e); }
  }

  async function stopSiren() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  useEffect(() => {
    let vibrationInterval: any;
    if (visible) {
      playSiren();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
      vibrationInterval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 1000);
    } else { stopSiren(); }
    return () => { if (vibrationInterval) clearInterval(vibrationInterval); stopSiren(); };
  }, [visible]);

  const handleDispatch = async () => {
    if (!incident) return;
    setDispatching(true);
    try {
      await supabase.from('incidents').update({
        status: 'Resolved',
        end_time: new Date().toISOString(),
        notes: 'Dispatched & acknowledged by Admin',
      }).eq('id', incident.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setDispatching(false);
    await stopSiren();
    onClose();
  };

  const handleAcknowledge = async () => {
    await stopSiren();
    onClose();
  };

  if (!incident) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <Animated.View style={[styles.alertCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={{ fontSize: 70 }}>{isFire ? '🔥' : '💨'}</Text>
        </Animated.View>

        <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
        <Text style={styles.houseName}>{incident.house_name}</Text>
        <Text style={styles.locationDetail}>{(incident.label || '').toUpperCase()}</Text>

        <View style={styles.ppmBadge}>
          <Text style={[styles.ppmValue, { color: isFire ? '#B71C1C' : '#E65100' }]}>
            {incident.flame ? 'FLAME' : `${livePpm} PPM`}
          </Text>
          <Text style={[styles.ppmLabel, { color: isFire ? '#B71C1C' : '#E65100' }]}>
            {incident.flame ? 'FIRE DETECTED (FLAME SENSOR)' : (isFire ? 'FIRE DETECTED (HIGH PPM)' : 'GAS / SMOKE DETECTED')}
          </Text>
        </View>

        <Text style={styles.instruction}>
          {isFire
            ? 'Immediate evacuation required.\nContact emergency services.'
            : 'Ventilate the area. Do not use open flames.'}
        </Text>

        <View style={styles.btnRow}>
          {/* Dispatch — Admin only */}
          {role === 'admin' && (
            <TouchableOpacity
              style={[styles.dispatchBtn, dispatching && { opacity: 0.6 }]}
              onPress={handleDispatch}
              disabled={dispatching}
            >
              <Text style={styles.dispatchBtnText}>
                {dispatching ? 'Dispatching...' : '🚒 DISPATCH & RESOLVE'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Acknowledge — available to everyone */}
          <TouchableOpacity style={styles.ackBtn} onPress={handleAcknowledge}>
            <Text style={styles.ackBtnText}>ACKNOWLEDGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  alertCircle: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  emergencyTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 4, marginBottom: 14 },
  houseName: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  locationDetail: { color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
  ppmBadge: {
    backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 16,
    borderRadius: 22, alignItems: 'center', marginTop: 26, marginBottom: 24, elevation: 10,
  },
  ppmValue: { fontSize: 38, fontWeight: '900' },
  ppmLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  instruction: { color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 36, opacity: 0.9 },
  btnRow: { width: '100%', gap: 12 },
  dispatchBtn: {
    backgroundColor: '#1a237e', width: '100%', padding: 20,
    borderRadius: 18, alignItems: 'center',
  },
  dispatchBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  ackBtn: {
    backgroundColor: 'rgba(0,0,0,0.35)', width: '100%', padding: 18,
    borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  ackBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
});
