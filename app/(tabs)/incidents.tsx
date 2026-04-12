import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/utils/supabase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/ThemeContext';

const ACCENT = '#E53935';

interface FamilyMember {
  id: number;
  full_name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

interface Incident {
  id: number;
  device_mac: string;
  status: 'Active' | 'Resolved';
  start_time: string;
  end_time: string | null;
  ppm_at_trigger: number;
  alert_type: string;
  notes: string | null;
  house_name?: string;
  label?: string;
  profile_id?: string;
  family_members?: FamilyMember[];
}

export default function IncidentsScreen() {
  const { role } = useAdminAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'Active' | 'Resolved' | 'All'>('Active');

  const fetch = async () => {
    try {
      let query = supabase
        .from('incidents')
        .select('*, devices(house_name, label)')
        .order('start_time', { ascending: false })
        .limit(100);

      if (filter !== 'All') query = query.eq('status', filter);

      const { data, error } = await query;
      if (data) {
        const mapped = await Promise.all(data.map(async (i: any) => {
          const { data: members } = await supabase
            .from('family_members')
            .select('*')
            .eq('profile_id', i.profile_id);

          return {
            ...i,
            house_name: i.devices?.house_name,
            label: i.devices?.label,
            family_members: members || [],
          };
        }));
        setIncidents(mapped);
      }
      if (error) console.error('Incidents fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetch(); }, [filter]);

  // Realtime: new incidents pop in immediately
  useEffect(() => {
    const ch = supabase.channel('incidents-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, async payload => {
        const i = payload.new as any;
        const { data: device } = await supabase.from('devices').select('house_name, label').eq('mac', i.device_mac).single();
        const { data: members } = await supabase.from('family_members').select('*').eq('profile_id', i.profile_id);
        
        const enriched = { 
          ...i, 
          house_name: device?.house_name, 
          label: device?.label,
          family_members: members || []
        };
        
        if (filter === 'Active' || filter === 'All') {
          setIncidents(prev => [enriched, ...prev]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      })
      .subscribe();
    return () => { ch.unsubscribe(); };
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetch();
  }, [filter]);

  const resolveIncident = (incident: Incident) => {
    if (role !== 'admin') {
      Alert.alert('Access Denied', 'Only Admins can resolve incidents.');
      return;
    }
    Alert.alert(
      'Resolve Incident',
      `Mark the incident at ${incident.house_name} — ${incident.label} as resolved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            const { error } = await supabase.from('incidents').update({
              status: 'Resolved',
              end_time: new Date().toISOString(),
            }).eq('id', incident.id);
            if (!error) {
              setIncidents(prev => prev.filter(i => i.id !== incident.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderIncident = ({ item }: { item: Incident }) => {
    const isActive = item.status === 'Active';
    const alertColor = item.alert_type === 'FIRE' ? ACCENT : '#FF9500';
    const date = new Date(item.start_time);

    return (
      <View style={[styles.card, { borderLeftColor: alertColor, backgroundColor: isDark ? '#141414' : '#fff' }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.alertType, { color: alertColor }]}>
              {item.alert_type === 'FIRE' ? '🔥' : '💨'} {item.alert_type}
            </Text>
            <Text style={[styles.houseName, { color: isDark ? '#fff' : '#000' }]}>{item.house_name || 'Unknown House'}</Text>
            <Text style={[styles.roomLabel, { color: isDark ? '#666' : '#888' }]}>{item.label || 'Unknown Room'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={[styles.statusPill, { backgroundColor: isActive ? `${ACCENT}25` : '#34C75925' }]}>
              <Text style={[styles.statusPillText, { color: isActive ? ACCENT : '#34C759' }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.ppmText, { color: alertColor }]}>{item.ppm_at_trigger} PPM</Text>
          </View>
        </View>

        {/* FAMILY MEMBERS SECTION */}
        {isActive && item.family_members && item.family_members.length > 0 && (
          <View style={styles.familySection}>
            <Text style={styles.familyTitle}>👥 HOUSEHOLD CONTACTS</Text>
            {item.family_members.map(m => (
              <View key={m.id} style={styles.familyMemberRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, { color: isDark ? '#ddd' : '#333' }]}>
                    {m.is_primary ? '⭐ ' : ''}{m.full_name}
                  </Text>
                  <Text style={styles.memberRel}>{m.relationship}</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(m.phone)}>
                  <IconSymbol name="phone.fill" size={14} color="#fff" />
                  <Text style={styles.callBtnText}>CALL</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: isDark ? '#1e1e1e' : '#eee' }]}>
          <Text style={[styles.timeText, { color: isDark ? '#555' : '#888' }]}>
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isActive && (
            <TouchableOpacity style={styles.resolveBtn} onPress={() => resolveIncident(item)}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#34C759" />
              <Text style={styles.resolveBtnText}>Resolve</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.brandText}>INCIDENT LOG</Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          {filter === 'Active' ? 'Active Incidents' : filter === 'Resolved' ? 'Resolved History' : 'All Incidents'}
        </Text>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(['Active', 'Resolved', 'All'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterPill, 
              { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderColor: isDark ? '#2a2a2a' : '#ddd' },
              filter === f && styles.filterPillActive
            ]}
            onPress={() => { setFilter(f); setLoading(true); }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={ACCENT} size="large" /></View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item.id.toString()}
          renderItem={renderIncident}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="checkmark.shield.fill" size={60} color={isDark ? "#222" : "#ddd"} />
              <Text style={[styles.emptyText, { color: isDark ? "#444" : "#888" }]}>No {filter.toLowerCase()} incidents</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10 },
  brandText: { color: ACCENT, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a' },
  filterPillActive: { backgroundColor: `${ACCENT}20`, borderColor: ACCENT },
  filterText: { color: '#666', fontWeight: '800', fontSize: 13 },
  filterTextActive: { color: ACCENT },
  list: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#141414', borderRadius: 18, marginBottom: 14, padding: 18, borderLeftWidth: 4,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, android: { elevation: 4 } }),
  },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  alertType: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  houseName: { color: '#fff', fontSize: 17, fontWeight: '900' },
  roomLabel: { color: '#666', fontSize: 12, fontWeight: '700', marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '900' },
  ppmText: { fontSize: 18, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e1e1e', paddingTop: 10 },
  timeText: { color: '#555', fontSize: 11, fontWeight: '700' },
  resolveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#34C75920', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resolveBtnText: { color: '#34C759', fontSize: 12, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#444', fontWeight: '700', marginTop: 16, fontSize: 14 },

  familySection: { 
    marginTop: 10, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
    marginBottom: 10
  },
  familyTitle: { fontSize: 10, fontWeight: '900', color: '#888', letterSpacing: 1, marginBottom: 5 },
  familyMemberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberName: { fontSize: 14, fontWeight: '700' },
  memberRel: { fontSize: 11, color: '#666', marginTop: 2 },
  callBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#34C759', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    gap: 6
  },
  callBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
