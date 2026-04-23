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

  // ... (rest of useEffects)

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
