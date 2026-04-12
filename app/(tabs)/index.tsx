import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Device, useAdmin } from '@/context/AdminContext';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform, RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ACCENT = '#E53935';

function getStatusData(ppm: number, isInactive: boolean, flame?: boolean) {
  if (isInactive) return { color: '#555', label: 'OFFLINE', icon: 'wifi.slash', msg: 'No signal' };
  if (ppm > 1500 || flame) return { color: ACCENT, label: flame ? '🔥 FLAME' : '🔥 FIRE', icon: 'flame.fill', msg: 'CRITICAL — EVACUATE NOW' };
  if (ppm > 450) return { color: '#FF9500', label: '💨 GAS/SMOKE', icon: 'exclamationmark.triangle.fill', msg: 'WARNING — Gas Detected' };
  return { color: '#34C759', label: 'SAFE', icon: 'checkmark.circle.fill', msg: 'All clear' };
}

interface GroupedHouse {
  house_name: string;
  community: string;
  devices: Device[];
  worstPpm: number;
  anyFlame: boolean;
}

export default function AdminDashboard() {
  const { allDevices, mqttConnected } = useAdmin();
  const { role } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const isDark = colorScheme === 'dark';

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Group devices by house_name
  const groupedHouses = useMemo((): GroupedHouse[] => {
    const map: Record<string, GroupedHouse> = {};
    Object.values(allDevices).forEach(dev => {
      const key = dev.house_name || dev.houseId || 'Unassigned';
      if (!map[key]) {
        map[key] = { house_name: key, community: dev.community || '', devices: [], worstPpm: 0, anyFlame: false };
      }
      map[key].devices.push(dev);
      if (dev.ppm > map[key].worstPpm) map[key].worstPpm = dev.ppm;
      if (dev.flame) map[key].anyFlame = true;
    });
    return Object.values(map).sort((a, b) => {
      if (a.anyFlame !== b.anyFlame) return a.anyFlame ? -1 : 1;
      return b.worstPpm - a.worstPpm;
    });
  }, [allDevices]);

  // Summary stats
  const totalDevices = Object.keys(allDevices).length;
  const dangerCount = Object.values(allDevices).filter(d => d.ppm > 1500 || d.flame).length;
  const warningCount = Object.values(allDevices).filter(d => d.ppm > 450 && d.ppm <= 1500 && !d.flame).length;
  const offlineCount = Object.values(allDevices).filter(
    d => !d.lastSeen || Date.now() - new Date(d.lastSeen).getTime() > 60000
  ).length;

  const renderDeviceRow = (dev: Device) => {
    const isInactive = !dev.lastSeen || Date.now() - new Date(dev.lastSeen).getTime() > 60000;
    const s = getStatusData(dev.ppm, isInactive, dev.flame);
    return (
      <View key={dev.mac} style={styles.deviceRow}>
        <View style={[styles.deviceDot, { backgroundColor: s.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.deviceLabel, { color: isDark ? '#ccc' : '#444' }]}>{dev.label}</Text>
          <Text style={[styles.deviceMac, { color: isDark ? '#444' : '#888' }]}>{dev.mac}</Text>
        </View>
        <Text style={[styles.devicePpm, { color: s.color }]}>
          {isInactive ? '--' : (dev.flame ? 'FLAME' : dev.ppm)} <Text style={styles.ppmUnit}>{dev.flame ? '' : 'PPM'}</Text>
        </Text>
      </View>
    );
  };

  const renderHouse = ({ item }: { item: GroupedHouse }) => {
    const isInactive = item.devices.every(
      d => !d.lastSeen || Date.now() - new Date(d.lastSeen).getTime() > 60000
    );
    const s = getStatusData(item.worstPpm, isInactive, item.anyFlame);
    return (
      <View style={[styles.houseCard, { borderLeftColor: s.color, backgroundColor: isDark ? '#141414' : '#fff' }]}>
        <View style={styles.houseHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.houseName, { color: isDark ? '#fff' : '#000' }]}>{item.house_name}</Text>
            <Text style={[styles.houseCommunity, { color: isDark ? '#555' : '#888' }]}>{item.community || 'Community'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.color + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <View style={styles.deviceList}>
          {item.devices.map(renderDeviceRow)}
        </View>
        {item.worstPpm > 0 && (
          <View style={styles.ppmBar}>
            <View style={[styles.ppmBarFill, {
              width: `${Math.min((item.worstPpm / 2000) * 100, 100)}%`,
              backgroundColor: s.color,
            }]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandText}>H-FIRE ADMIN</Text>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Command Center</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.connBadge, { backgroundColor: mqttConnected ? '#34C75920' : '#55555520' }]}>
            <View style={[styles.connDot, { backgroundColor: mqttConnected ? '#34C759' : '#555' }]} />
            <Text style={[styles.connText, { color: mqttConnected ? '#34C759' : '#888' }]}>
              {mqttConnected ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: role === 'admin' ? `${ACCENT}25` : '#1565C025' }]}>
            <Text style={[styles.roleText, { color: role === 'admin' ? ACCENT : '#42A5F5' }]}>
              {role === 'admin' ? '🔴 ADMIN' : '🔵 HOA'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: '#34C75940', backgroundColor: isDark ? '#141414' : '#fff' }]}>
          <IconSymbol name="cpu" size={14} color="#34C759" />
          <Text style={[styles.statNum, { color: '#34C759' }]}>{totalDevices}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>TOTAL DEVICES</Text>
        </View>
        <View style={[styles.statCard, { borderColor: ACCENT + '40', backgroundColor: isDark ? '#141414' : '#fff' }]}>
          <IconSymbol name="flame.fill" size={14} color={dangerCount > 0 ? ACCENT : '#555'} />
          <Text style={[styles.statNum, { color: dangerCount > 0 ? ACCENT : (isDark ? '#333' : '#ccc') }]}>{dangerCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>ACTIVE FIRES</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#FF950040', backgroundColor: isDark ? '#141414' : '#fff' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={14} color={warningCount > 0 ? '#FF9500' : '#555'} />
          <Text style={[styles.statNum, { color: warningCount > 0 ? '#FF9500' : (isDark ? '#333' : '#ccc') }]}>{warningCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>MODERATE RISK</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#55555540', backgroundColor: isDark ? '#141414' : '#fff' }]}>
          <IconSymbol name="wifi.slash" size={14} color={offlineCount > 0 ? (isDark ? '#888' : '#666') : '#555'} />
          <Text style={[styles.statNum, { color: offlineCount > 0 ? (isDark ? '#888' : '#666') : (isDark ? '#333' : '#ccc') }]}>{offlineCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>OFFLINE UNITS</Text>
        </View>
      </View>

      <FlatList
        data={groupedHouses}
        keyExtractor={item => item.house_name}
        renderItem={renderHouse}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="waveform.path.ecg" size={60} color={isDark ? "#333" : "#ddd"} />
            <Text style={[styles.emptyText, { color: isDark ? '#444' : '#aaa' }]}>Waiting for telemetry from all households...</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  brandText: { color: ACCENT, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  connBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  connDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  connText: { fontSize: 10, fontWeight: '900' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  roleText: { fontSize: 11, fontWeight: '900' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#141414', borderRadius: 16, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  statNum: { fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#555', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  list: { padding: 16, paddingBottom: 120 },
  houseCard: {
    backgroundColor: '#141414', borderRadius: 20, marginBottom: 16,
    padding: 18, borderLeftWidth: 4,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 4 } }),
  },
  houseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  houseName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  houseCommunity: { color: '#555', fontSize: 11, fontWeight: '700', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '900' },
  deviceList: { gap: 10, marginBottom: 14 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deviceDot: { width: 8, height: 8, borderRadius: 4 },
  deviceLabel: { fontSize: 13, fontWeight: '700' },
  deviceMac: { fontSize: 10, fontWeight: '600' },
  devicePpm: { fontSize: 20, fontWeight: '900' },
  ppmUnit: { fontSize: 10, color: '#888' },
  ppmBar: { height: 3, backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: 2, overflow: 'hidden' },
  ppmBarFill: { height: '100%', borderRadius: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontWeight: '700', marginTop: 16, textAlign: 'center', lineHeight: 22 },
});
