import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { supabase } from '@/utils/supabase';

export interface Device {
  id: string;
  mac: string;
  ppm: number;
  flame?: boolean;
  status: string;
  label: string;
  houseId: string;
  community?: string;
  lastSeen: Date;
  profile_id?: string | null;
  house_name?: string;
}

interface Incident {
  id: string | number;
  house_name: string;
  label: string;
  ppm: number;
  flame?: boolean;
  alert_type: 'FIRE' | 'GAS/SMOKE';
  device_mac?: string;
}

interface AdminContextType {
  allDevices: Record<string, Device>;
  allProfiles: Record<string, any>;
  activeIncident: Incident | null;
  triggerEmergency: (incident: Incident) => void;
  dismissEmergency: () => void;
  mqttConnected: boolean;
  refreshRegistry: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const HIVEMQ_URL = `wss://${process.env.EXPO_PUBLIC_HIVEMQ_BROKER}:${process.env.EXPO_PUBLIC_HIVEMQ_PORT}/mqtt`;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [allDevices, setAllDevices] = useState<Record<string, Device>>({});
  const [allProfiles, setAllProfiles] = useState<Record<string, any>>({});
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  const registryRef = useRef<Record<string, any>>({});
  const mutedDevices = useRef<Record<string, number>>({});

  // Load all device + profile metadata from Supabase
  const loadRegistry = async () => {
    const { data: devs } = await supabase.from('devices').select('*');
    if (devs) {
      const cache: Record<string, any> = {};
      devs.forEach(d => { cache[d.mac] = d; });
      registryRef.current = cache;
    }
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles) {
      const cache: Record<string, any> = {};
      profiles.forEach(p => { cache[p.id] = p; });
      setAllProfiles(cache);
    }
  };

  useEffect(() => { loadRegistry(); }, []);

  // Supabase Realtime for device registry changes
  useEffect(() => {
    const ch = supabase.channel('admin-registry-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, payload => {
        const d = payload.new as any;
        if (d) registryRef.current = { ...registryRef.current, [d.mac]: d };
      })
      .subscribe();
    return () => { ch.unsubscribe(); };
  }, []);

  // MQTT — subscribe to ALL hfire/# topics
  useEffect(() => {
    const client = mqtt.connect(HIVEMQ_URL, {
      protocol: 'wss',
      path: '/mqtt',
      username: process.env.EXPO_PUBLIC_HIVEMQ_USERNAME,
      password: process.env.EXPO_PUBLIC_HIVEMQ_PASSWORD,
      clientId: `hfire_admin_${Math.random().toString(16).slice(2, 10)}`,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      setMqttConnected(true);
      client.subscribe('hfire/#');
    });
    client.on('close', () => setMqttConnected(false));

    client.on('message', (topic, message) => {
      try {
        const payload = message.toString();
        if (!payload.startsWith('{')) return;
        const data = JSON.parse(payload);
        const mac: string = data.mac;
        if (!mac || !mac.includes(':')) return;

        const regInfo = registryRef.current[mac];
        const isFlame = data.flame === true;
        const updated: Device = {
          id: mac,
          mac,
          ppm: data.ppm !== undefined ? parseInt(data.ppm) : 0,
          flame: isFlame,
          status: (data.ppm > 1500 || isFlame) ? 'Danger' : data.ppm > 450 ? 'Warning' : 'Normal',
          label: regInfo?.label || `Device ${mac.slice(-4)}`,
          houseId: regInfo?.house_name || topic.split('/')[1],
          house_name: regInfo?.house_name,
          community: regInfo?.community,
          lastSeen: new Date(),
          profile_id: regInfo?.profile_id,
        };

        setAllDevices(prev => ({ ...prev, [mac]: updated }));

        // Trigger emergency for FIRE/WARNING if not muted
        if (updated.ppm > 450 || isFlame) {
          const muteTime = mutedDevices.current[mac] || 0;
          if (Date.now() - muteTime > 120000) {
            setActiveIncident({
              id: `mqtt_${Date.now()}`,
              house_name: regInfo?.house_name || 'Unknown House',
              label: regInfo?.label || 'Unknown Room',
              ppm: updated.ppm,
              flame: isFlame,
              alert_type: (updated.ppm > 1500 || isFlame) ? 'FIRE' : 'GAS/SMOKE',
              device_mac: mac,
            });
          }
        }
      } catch {}
    });

    return () => { client.end(); };
  }, []);

  const triggerEmergency = (incident: Incident) => {
    const mac = incident.device_mac || '';
    if (Date.now() - (mutedDevices.current[mac] || 0) < 120000) return;
    setActiveIncident(incident);
  };

  const dismissEmergency = () => {
    if (activeIncident?.device_mac) {
      mutedDevices.current[activeIncident.device_mac] = Date.now();
    }
    setActiveIncident(null);
  };

  return (
    <AdminContext.Provider value={{ 
      allDevices, allProfiles, activeIncident, triggerEmergency, dismissEmergency, mqttConnected,
      refreshRegistry: loadRegistry
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
}
