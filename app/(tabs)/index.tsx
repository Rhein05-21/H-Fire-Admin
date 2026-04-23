import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Device, useAdmin } from '@/context/AdminContext';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const { allDevices, allProfiles, mqttConnected } = useAdmin();
  const { role } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllDevicesModal, setShowAllDevicesModal] = useState(false);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  
  const [logCount, setLogCount] = useState(0);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const isDark = colorScheme === 'dark';

  const fetchActivity = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const { count } = await supabase
      .from('gas_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    setLogCount(count || 0);
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      // Broadcast via Supabase Realtime channel
      const channel = supabase.channel('global-alerts');
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'emergency',
            payload: { 
              message: broadcastMessage.trim(),
              sender: 'ADMIN',
              timestamp: new Date().toISOString()
            },
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Success', 'Broadcast sent to all active community members.');
          setBroadcastMessage('');
          setShowBroadcastModal(false);
          setBroadcasting(false);
          supabase.removeChannel(channel);
        }
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to send broadcast.');
      setBroadcasting(false);
    }
  };

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
  const userList = useMemo(() => {
    return Object.values(allProfiles).filter(p => !p.is_admin);
  }, [allProfiles]);
  const userCount = userList.length;
  const communityCount = new Set(groupedHouses.map(h => h.community).filter(Boolean)).size || (groupedHouses.length > 0 ? 1 : 0);
  
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
        <TouchableOpacity 
          style={[styles.statCard, { borderColor: '#34C75940', backgroundColor: isDark ? '#141414' : '#fff' }]}
          onPress={() => setShowAllDevicesModal(true)}
          activeOpacity={0.7}
          // Smaller hitSlop to avoid overlap
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <IconSymbol name="cpu" size={14} color="#34C759" />
          <Text style={[styles.statNum, { color: '#34C759' }]}>{totalDevices}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>DEVICES</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { borderColor: '#2196F340', backgroundColor: isDark ? '#141414' : '#fff' }]}
          onPress={() => setShowAllUsersModal(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
        >
          <IconSymbol name="person.2.fill" size={14} color="#2196F3" />
          <Text style={[styles.statNum, { color: '#2196F3' }]}>{userCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>USERS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { borderColor: '#AF52DE40', backgroundColor: isDark ? '#141414' : '#fff' }]}
          onPress={fetchActivity}
        >
          <IconSymbol name="waveform.path.ecg" size={14} color="#AF52DE" />
          <Text style={[styles.statNum, { color: '#AF52DE' }]}>{logCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#555' : '#888' }]}>ACTIVITY</Text>
        </TouchableOpacity>
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

      {/* ALL DEVICES MODAL */}
      <Modal visible={showAllDevicesModal} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackBtn} 
              onPress={() => setShowAllDevicesModal(false)}
            >
              <IconSymbol name="chevron.left" size={24} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.modalBackText, { color: isDark ? '#fff' : '#000' }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: isDark ? '#fff' : '#000' }]}>All Devices</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <FlatList
            data={Object.values(allDevices)}
            keyExtractor={(item) => item.mac}
            renderItem={({ item }) => (
              <View style={[styles.houseCard, { backgroundColor: isDark ? '#141414' : '#fff', marginBottom: 10 }]}>
                {renderDeviceRow(item)}
              </View>
            )}
            contentContainerStyle={styles.modalList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* ALL USERS MODAL */}
      <Modal visible={showAllUsersModal} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackBtn} 
              onPress={() => setShowAllUsersModal(false)}
            >
              <IconSymbol name="chevron.left" size={24} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.modalBackText, { color: isDark ? '#fff' : '#000' }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: isDark ? '#fff' : '#000' }]}>Community Users</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <FlatList
            data={userList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.houseCard, { backgroundColor: isDark ? '#141414' : '#fff', marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  <View style={[styles.userAvatar, { backgroundColor: isDark ? '#222' : '#f0f0f0' }]}>
                    <IconSymbol name="person.fill" size={20} color={isDark ? '#555' : '#888'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.houseName, { color: isDark ? '#fff' : '#000', fontSize: 16 }]}>{item.name}</Text>
                    <Text style={[styles.userEmail, { color: isDark ? '#2196F3' : '#1565C0' }]}>
                      {/* Note: Profiles might not have email, showing Community as fallback or Gmail if available */}
                      {item.community || 'Resident'}
                    </Text>
                    <Text style={[styles.houseCommunity, { color: isDark ? '#444' : '#999', marginTop: 2 }]}>
                      UID: {item.id.slice(0, 8)}...
                    </Text>
                  </View>
                  {item.block_lot && (
                    <View style={styles.locationBadge}>
                      <Text style={styles.locationBadgeText}>{item.block_lot}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={styles.modalList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ color: '#888' }}>No residents found.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* BROADCAST MODAL */}
      <Modal visible={showBroadcastModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.broadcastCard, { backgroundColor: isDark ? '#141414' : '#fff' }]}>
            <View style={styles.broadcastHeader}>
              <IconSymbol name="megaphone.fill" size={24} color={ACCENT} />
              <Text style={[styles.modalHeaderTitle, { color: isDark ? '#fff' : '#000', marginLeft: 10 }]}>Community Broadcast</Text>
            </View>
            
            <Text style={[styles.broadcastDesc, { color: isDark ? '#888' : '#666' }]}>
              This will send a real-time emergency alert to all active residents.
            </Text>

            <TextInput
              style={[styles.broadcastInput, { 
                backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
                color: isDark ? '#fff' : '#000'
              }]}
              placeholder="Type your emergency message..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={4}
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
            />

            <View style={styles.broadcastActions}>
              <TouchableOpacity 
                style={[styles.broadcastBtn, { backgroundColor: isDark ? '#222' : '#eee' }]} 
                onPress={() => setShowBroadcastModal(false)}
              >
                <Text style={[styles.broadcastBtnText, { color: isDark ? '#fff' : '#000' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.broadcastBtn, { backgroundColor: ACCENT }]} 
                onPress={handleBroadcast}
                disabled={broadcasting}
              >
                {broadcasting ? <ActivityIndicator color="#fff" /> : (
                  <Text style={[styles.broadcastBtnText, { color: '#fff' }]}>Send Alert</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1, backgroundColor: '#141414', borderRadius: 16, padding: 10,
    alignItems: 'center', borderWidth: 1, minHeight: 85, justifyContent: 'center',
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

  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  modalBackBtn: { flexDirection: 'row', alignItems: 'center' },
  modalBackText: { fontSize: 16, fontWeight: '700', marginLeft: 5 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '900' },
  modalList: { padding: 16 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  userEmail: { fontSize: 12, fontWeight: '700' },
  locationBadge: { backgroundColor: 'rgba(33, 150, 243, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  locationBadgeText: { color: '#2196F3', fontSize: 10, fontWeight: '900' },

  // Broadcast Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  broadcastCard: { borderRadius: 24, padding: 24, gap: 16 },
  broadcastHeader: { flexDirection: 'row', alignItems: 'center' },
  broadcastDesc: { fontSize: 14, lineHeight: 20 },
  broadcastInput: { borderRadius: 12, padding: 15, fontSize: 16, height: 100, textAlignVertical: 'top' },
  broadcastActions: { flexDirection: 'row', gap: 12 },
  broadcastBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  broadcastBtnText: { fontWeight: '900', fontSize: 14 },
});
