import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Device, useAdmin } from '@/context/AdminContext';
import { useAppTheme } from '@/context/ThemeContext';
import { supabase } from '@/utils/supabase';
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

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  hoa: 'HOA Member',
  resident: 'Resident',
  guard: 'Security Guard'
};

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
  const { allDevices, allProfiles, allFamilyMembers, mqttConnected } = useAdmin();
  const { role } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllDevicesModal, setShowAllDevicesModal] = useState(false);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  
  const [logCount, setLogCount] = useState(0);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const [deviceSearch, setDeviceSearch] = useState('');
  const [devicePage, setDevicePage] = useState(1);
  const PAGE_SIZE = 10;

  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserData, setEditUser] = useState({
    name: '',
    email: '',
    block_lot: '',
    address: ''
  });

  // Create User Form State
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setCreatingUser(true); // Reusing loading state
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editUserData.name,
          email: editUserData.email.toLowerCase(),
          block_lot: editUserData.block_lot,
          address: editUserData.address
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('Success', 'User profile updated successfully.');
      setIsEditingUser(false);
      setShowUserDetail(false);
      // Data will refresh via Realtime/Context
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setCreatingUser(false);
    }
  };
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'resident' as 'admin' | 'hoa' | 'resident' | 'guard',
    block_lot: '',
    community: ''
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const validateField = async (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.length > 0 && value.length < 2) error = 'Minimum 2 characters required';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.length > 0) {
          if (!emailRegex.test(value)) {
            error = 'Invalid email format';
          } else {
            // Real-time DB Check
            const { data } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', value.toLowerCase())
              .single();
            if (data) error = 'This email is already registered';
          }
        }
        break;
      case 'password':
        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (value.length > 0) {
          if (value.length < 8) error = 'Minimum 8 characters required';
          else if (!strongPassword.test(value)) error = 'Must include Upper, Lower, Number, and Special Char';
        }
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

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
      await channel.subscribe(async (status: string) => {
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

  // Group devices by house_name (Only active devices for the main feed)
  const groupedHouses = useMemo((): GroupedHouse[] => {
    const map: Record<string, GroupedHouse> = {};
    const now = Date.now();

    Object.values(allDevices).forEach(dev => {
      // Filter: Only show devices seen in the last 60 seconds on the main dashboard
      const isInactive = !dev.lastSeen || (now - new Date(dev.lastSeen).getTime() > 60000);
      if (isInactive) return;

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

  const filteredUsers = useMemo(() => {
    return Object.values(allProfiles).filter(p => {
      const search = userSearch.toLowerCase();
      const nameMatch = (p.name || '').toLowerCase().includes(search);
      const emailMatch = (p.email || '').toLowerCase().includes(search);
      const blockMatch = (p.block_lot || '').toLowerCase().includes(search);
      return nameMatch || emailMatch || blockMatch;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allProfiles, userSearch]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(0, userPage * PAGE_SIZE);
  }, [filteredUsers, userPage]);

  const userCount = filteredUsers.length;

  const handleCreateUser = async () => {
    const { firstName, lastName, email, password, role: userRole, block_lot, community } = newUser;
    
    // Final validation check before submission
    const hasErrors = Object.values(formErrors).some(e => e !== '');
    if (hasErrors) {
      Alert.alert('Form Errors', 'Please fix all errors before saving.');
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setCreatingUser(true);
    try {
      // 1. Check if email already exists
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('email', email.toLowerCase())
        .single();
      
      if (existingEmail) {
        Alert.alert('Duplicate Email', `An account with ${email} already exists for ${existingEmail.name}.`);
        setCreatingUser(false);
        return;
      }

      // 2. Check if name + block_lot combination exists (to prevent duplicate residents in same house)
      const fullName = `${firstName} ${lastName}`;
      const { data: existingResident } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', fullName)
        .eq('block_lot', block_lot)
        .single();

      if (existingResident) {
        Alert.alert('Duplicate Resident', `A resident named ${fullName} is already registered at ${block_lot}.`);
        setCreatingUser(false);
        return;
      }

      // Generate a dummy ID for prototype
      const dummyId = `user_${Math.random().toString(36).slice(2, 11)}`;
      
      const { error } = await supabase.from('profiles').insert({
        id: dummyId,
        name: fullName,
        email: email.toLowerCase(),
        block_lot,
        address: community || 'H-Fire Village',
        is_admin: userRole === 'admin' || userRole === 'hoa',
      });

      if (error) throw error;

      Alert.alert('Success', `Account for ${firstName} created successfully! (Clerk Auth integration required for production)`);
      setShowCreateUser(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'resident', block_lot: '', community: '' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create account.');
    } finally {
      setCreatingUser(false);
    }
  };
  const communityCount = new Set(groupedHouses.map(h => h.community).filter(Boolean)).size || (groupedHouses.length > 0 ? 1 : 0);
  
  // Filtered and Paginated Devices for Modal
  const filteredDevices = useMemo(() => {
    const list = Object.values(allDevices).filter(d => 
      d.mac.toLowerCase().includes(deviceSearch.toLowerCase()) || 
      d.label.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      d.house_name?.toLowerCase().includes(deviceSearch.toLowerCase())
    );
    return list;
  }, [allDevices, deviceSearch]);

  const paginatedDevices = useMemo(() => {
    return filteredDevices.slice(0, devicePage * PAGE_SIZE);
  }, [filteredDevices, devicePage]);

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
    
    // Find the owner/resident of the first device in this house
    const ownerId = item.devices[0]?.profile_id;
    const owner = ownerId ? allProfiles[ownerId] : null;

    return (
      <View style={[styles.houseCard, { borderLeftColor: s.color, backgroundColor: isDark ? '#141414' : '#fff' }]}>
        <View style={styles.houseHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.houseName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={2}>
              {owner?.block_lot || item.house_name}
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.houseCommunity, { color: isDark ? '#555' : '#888', marginTop: 0 }]}>
                {owner ? owner.name : 'Unassigned'}
              </Text>
              <Text style={[styles.houseCommunity, { color: isDark ? '#444' : '#666', marginTop: 2, fontSize: 10 }]} numberOfLines={3}>
                {owner?.address || item.community || 'H-Fire Village'}
              </Text>
            </View>
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
          <View style={[styles.roleBadge, { backgroundColor: role === 'admin' ? `${ACCENT}25` : (role === 'hoa' ? '#1565C025' : '#4CAF5025') }]}>
            <Text style={[styles.roleText, { color: role === 'admin' ? ACCENT : (role === 'hoa' ? '#42A5F5' : '#4CAF50') }]}>
              {role === 'admin' ? '🔴 ADMIN' : (role === 'hoa' ? '🔵 HOA' : '🟢 GUARD')}
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

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
              placeholder="Search MAC, Label, House..."
              placeholderTextColor="#555"
              value={deviceSearch}
              onChangeText={(t) => { setDeviceSearch(t); setDevicePage(1); }}
            />
          </View>
          
          <FlatList
            data={paginatedDevices}
            keyExtractor={(item) => item.mac}
            onEndReached={() => {
              if (paginatedDevices.length < filteredDevices.length) {
                setDevicePage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              const profile = item.profile_id ? allProfiles[item.profile_id] : null;
              return (
                <View style={[styles.houseCard, { backgroundColor: isDark ? '#141414' : '#fff', marginBottom: 10 }]}>
                  {renderDeviceRow(item)}
                  <View style={styles.deviceMeta}>
                    <IconSymbol name="person.fill" size={12} color="#888" />
                    <Text style={styles.deviceMetaText}>
                      Linked Account: <Text style={{ color: profile ? '#2196F3' : '#888' }}>{profile?.name || 'Unlinked'}</Text>
                    </Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.modalList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ color: '#888' }}>No devices found matching your search.</Text>
              </View>
            }
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
            {role === 'admin' && (
              <TouchableOpacity 
                style={[styles.connBadge, { backgroundColor: ACCENT + '20' }]} 
                onPress={() => setShowCreateUser(true)}
              >
                <Text style={{ color: ACCENT, fontWeight: '900', fontSize: 10 }}>+ ADD USER</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
              placeholder="Search by Name, Email, or Block/Lot..."
              placeholderTextColor="#555"
              value={userSearch}
              onChangeText={(t) => { setUserSearch(t); setUserPage(1); }}
            />
          </View>
          
          <FlatList
            data={paginatedUsers}
            keyExtractor={(item) => item.id}
            onEndReached={() => {
              if (paginatedUsers.length < filteredUsers.length) {
                setUserPage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              const userRole = item.is_admin ? 'Admin/HOA' : (item.name?.toLowerCase().includes('guard') ? 'Guard' : 'Resident');
              const hasLocation = item.latitude && item.longitude;
              return (
                <TouchableOpacity 
                  style={[styles.houseCard, { backgroundColor: isDark ? '#141414' : '#fff', marginBottom: 12 }]}
                  onPress={() => {
                    setSelectedUser(item);
                    setShowUserDetail(true);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <View style={[styles.userAvatar, { backgroundColor: isDark ? '#222' : '#f0f0f0' }]}>
                      <IconSymbol name="person.fill" size={20} color={isDark ? '#555' : '#888'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.houseName, { color: isDark ? '#fff' : '#000', fontSize: 16 }]}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.userEmail, { color: isDark ? '#2196F3' : '#1565C0' }]}>
                          {userRole}
                        </Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isDark ? '#333' : '#ddd' }} />
                        <IconSymbol name="map.fill" size={10} color={hasLocation ? '#34C759' : '#888'} />
                        <Text style={[styles.houseCommunity, { color: hasLocation ? '#34C759' : (isDark ? '#444' : '#999'), marginTop: 0, fontWeight: '700' }]}>
                          {item.block_lot || 'No location set'}
                        </Text>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#444" />
                  </View>
                </TouchableOpacity>
              );
            }}
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

      {/* CREATE USER MODAL */}
      <Modal visible={showCreateUser} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateUser(false)}>
              <Text style={{ color: ACCENT, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: isDark ? '#fff' : '#000' }]}>Create Account</Text>
            <TouchableOpacity onPress={handleCreateUser} disabled={creatingUser}>
              {creatingUser ? <ActivityIndicator size="small" color={ACCENT} /> : (
                <Text style={{ color: '#2196F3', fontWeight: '900' }}>SAVE</Text>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={[1]}
            keyExtractor={i => i.toString()}
            renderItem={() => (
              <View style={{ padding: 24, gap: 20 }}>
                <Text style={[styles.broadcastDesc, { marginBottom: -10, color: isDark ? '#aaa' : '#555' }]}>
                  Fields marked with * are required. Email must be unique.
                </Text>

                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>FULL NAME *</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[styles.formInput, { 
                          backgroundColor: isDark ? '#141414' : '#fff', 
                          color: isDark ? '#fff' : '#000',
                          borderColor: formErrors.firstName ? ACCENT : (newUser.firstName.length >= 2 ? '#34C759' : 'rgba(128,128,128,0.1)')
                        }]}
                        placeholder="First Name"
                        placeholderTextColor="#555"
                        value={newUser.firstName}
                        onChangeText={t => {
                          setNewUser(p => ({ ...p, firstName: t }));
                          validateField('firstName', t);
                        }}
                      />
                      {formErrors.firstName ? <Text style={styles.errorText}>{formErrors.firstName}</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[styles.formInput, { 
                          backgroundColor: isDark ? '#141414' : '#fff', 
                          color: isDark ? '#fff' : '#000',
                          borderColor: formErrors.lastName ? ACCENT : (newUser.lastName.length >= 2 ? '#34C759' : 'rgba(128,128,128,0.1)')
                        }]}
                        placeholder="Last Name"
                        placeholderTextColor="#555"
                        value={newUser.lastName}
                        onChangeText={t => {
                          setNewUser(p => ({ ...p, lastName: t }));
                          validateField('lastName', t);
                        }}
                      />
                      {formErrors.lastName ? <Text style={styles.errorText}>{formErrors.lastName}</Text> : null}
                    </View>
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>EMAIL ADDRESS *</Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: isDark ? '#141414' : '#fff', 
                      color: isDark ? '#fff' : '#000',
                      borderColor: formErrors.email ? ACCENT : (newUser.email.includes('@') && !formErrors.email ? '#34C759' : 'rgba(128,128,128,0.1)')
                    }]}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#555"
                    autoCapitalize="none"
                    value={newUser.email}
                    onChangeText={t => {
                      setNewUser(p => ({ ...p, email: t }));
                      validateField('email', t);
                    }}
                  />
                  {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : (
                    newUser.email.includes('@') ? <Text style={[styles.errorText, { color: '#34C759' }]}>Email is available</Text> : null
                  )}
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>PASSWORD *</Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: isDark ? '#141414' : '#fff', 
                      color: isDark ? '#fff' : '#000',
                      borderColor: formErrors.password ? ACCENT : (newUser.password.length >= 8 ? '#34C759' : 'rgba(128,128,128,0.1)')
                    }]}
                    placeholder="Min 8 chars, 1 special, 1 number"
                    placeholderTextColor="#555"
                    secureTextEntry
                    value={newUser.password}
                    onChangeText={t => {
                      setNewUser(p => ({ ...p, password: t }));
                      validateField('password', t);
                    }}
                  />
                  {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>ACCOUNT ROLE *</Text>
                  <View style={styles.roleSelector}>
                    {Object.entries(ROLE_LABELS).map(([r, label]) => (
                      <TouchableOpacity 
                        key={r}
                        style={[
                          styles.roleOption, 
                          { 
                            backgroundColor: newUser.role === r ? (isDark ? '#222' : '#f0f0f0') : (isDark ? '#141414' : '#fff'), 
                            borderColor: newUser.role === r ? ACCENT : 'rgba(128,128,128,0.1)',
                            width: '48%'
                          }
                        ]}
                        onPress={() => setNewUser(p => ({ ...p, role: r as any }))}
                      >
                        <Text style={[styles.roleOptionText, { color: newUser.role === r ? ACCENT : (isDark ? '#444' : '#888') }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>LOCATION (BLOCK/LOT)</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
                    placeholder="e.g. Block 1 Lot 2"
                    placeholderTextColor="#555"
                    value={newUser.block_lot}
                    onChangeText={t => setNewUser(p => ({ ...p, block_lot: t }))}
                  />
                </View>
                
                <View style={{ gap: 8 }}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>COMMUNITY ADDRESS</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
                    placeholder="Community Name"
                    placeholderTextColor="#555"
                    value={newUser.community}
                    onChangeText={t => setNewUser(p => ({ ...p, community: t }))}
                  />
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* USER DETAIL MODAL */}
      <Modal visible={showUserDetail} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              if (isEditingUser) setIsEditingUser(false);
              else setShowUserDetail(false);
            }}>
              <Text style={{ color: ACCENT, fontWeight: '700' }}>{isEditingUser ? 'Cancel' : 'Back'}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: isDark ? '#fff' : '#000' }]}>
              {isEditingUser ? 'Edit Profile' : 'User Profile'}
            </Text>
            {((role === 'admin') || (role === 'hoa' && !selectedUser?.is_admin)) && (
              <TouchableOpacity onPress={() => {
                if (isEditingUser) handleUpdateUser();
                else {
                  setEditUser({
                    name: selectedUser.name,
                    email: selectedUser.email || '',
                    block_lot: selectedUser.block_lot || '',
                    address: selectedUser.address || ''
                  });
                  setIsEditingUser(true);
                }
              }}>
                <Text style={{ color: '#2196F3', fontWeight: '900' }}>{isEditingUser ? 'SAVE' : 'EDIT'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedUser && (
            <FlatList
              data={[1]}
              keyExtractor={i => i.toString()}
              renderItem={() => {
                const family = allFamilyMembers.filter(f => f.profile_id === selectedUser.id);
                const userRole = selectedUser.is_admin ? 'Admin/HOA' : (selectedUser.name?.toLowerCase().includes('guard') ? 'Guard' : 'Resident');
                const hasPush = !!selectedUser.push_token;
                
                return (
                  <View style={{ padding: 24 }}>
                    {!isEditingUser ? (
                      <>
                        <View style={{ alignItems: 'center', marginBottom: 30 }}>
                          <View style={[styles.detailAvatar, { backgroundColor: isDark ? '#141414' : '#fff' }]}>
                            <IconSymbol name="person.fill" size={40} color={ACCENT} />
                          </View>
                          <Text style={[styles.detailName, { color: isDark ? '#fff' : '#000' }]}>{selectedUser.name}</Text>
                          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <View style={[styles.roleBadge, { backgroundColor: ACCENT + '15' }]}>
                              <Text style={{ color: ACCENT, fontWeight: '900', fontSize: 10 }}>{userRole.toUpperCase()}</Text>
                            </View>
                            <View style={[styles.roleBadge, { backgroundColor: hasPush ? '#34C75920' : '#55555520' }]}>
                              <Text style={{ color: hasPush ? '#34C759' : '#888', fontWeight: '900', fontSize: 10 }}>
                                {hasPush ? '🔔 PUSH ACTIVE' : '🔕 NO PUSH'}
                              </Text>
                            </View>
                          </View>
                        </View>

                    <View style={[styles.infoSection, { backgroundColor: isDark ? '#141414' : '#fff' }]}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>LOCATION</Text>
                        <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000', flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                          {selectedUser.block_lot || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>COMMUNITY</Text>
                        <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000', flex: 1, textAlign: 'right' }]} numberOfLines={3}>
                          {selectedUser.address || selectedUser.community || 'H-Fire Village'}
                        </Text>
                      </View>
                    </View>

                        <Text style={[styles.sectionTitle, { color: isDark ? '#555' : '#888' }]}>FAMILY MEMBERS ({family.length})</Text>
                        <View style={[styles.infoSection, { backgroundColor: isDark ? '#141414' : '#fff' }]}>
                          {family.length > 0 ? family.map((f, idx) => (
                            <View key={idx} style={[styles.infoRow, { borderBottomWidth: idx === family.length - 1 ? 0 : 1, borderBottomColor: 'rgba(128,128,128,0.05)' }]}>
                              <View>
                                <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000' }]}>{f.full_name}</Text>
                                <Text style={{ fontSize: 10, color: '#888' }}>{f.relationship} • {f.age} yrs old</Text>
                              </View>
                              <Text style={{ color: '#2196F3', fontSize: 10, fontWeight: '700' }}>{f.phone}</Text>
                            </View>
                          )) : (
                            <Text style={{ textAlign: 'center', color: '#555', padding: 10 }}>No family members linked.</Text>
                          )}
                        </View>
                      </>
                    ) : (
                      <View style={{ gap: 20 }}>
                        <View style={{ gap: 8 }}>
                          <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>FULL NAME</Text>
                          <TextInput
                            style={[styles.formInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
                            value={editUserData.name}
                            onChangeText={t => setEditUser(p => ({ ...p, name: t }))}
                          />
                        </View>
                        <View style={{ gap: 8 }}>
                          <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>LOCATION (BLOCK/LOT)</Text>
                          <TextInput
                            style={[styles.formInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
                            value={editUserData.block_lot}
                            onChangeText={t => setEditUser(p => ({ ...p, block_lot: t }))}
                          />
                        </View>
                        <View style={{ gap: 8 }}>
                          <Text style={[styles.inputLabel, { color: isDark ? '#555' : '#888' }]}>ADDRESS</Text>
                          <TextInput
                            style={[styles.formInput, { backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#000' }]}
                            value={editUserData.address}
                            onChangeText={t => setEditUser(p => ({ ...p, address: t }))}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              }}
            />
          )}
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
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { height: 45, borderRadius: 12, paddingHorizontal: 15, fontSize: 14, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  deviceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.05)', gap: 6 },
  deviceMetaText: { fontSize: 11, fontWeight: '600', color: '#888' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  userEmail: { fontSize: 12, fontWeight: '700' },
  locationBadge: { backgroundColor: 'rgba(33, 150, 243, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  locationBadgeText: { color: '#2196F3', fontSize: 10, fontWeight: '900' },

  // Form Styles
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  formInput: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  errorText: { color: ACCENT, fontSize: 10, fontWeight: '700', marginTop: 4, marginLeft: 4 },
  roleSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  roleOptionText: { fontSize: 10, fontWeight: '900' },

  // Detail Styles
  detailAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  detailName: { fontSize: 24, fontWeight: '900', marginTop: 16 },
  infoSection: { borderRadius: 20, padding: 20, gap: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 9, fontWeight: '900', color: '#888', letterSpacing: 1 },
  infoValue: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12, marginLeft: 10 },

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
