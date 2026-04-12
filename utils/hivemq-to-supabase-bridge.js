const mqtt = require('mqtt');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Using anon key as fallback.');
}

const HIVEMQ_URL = `wss://${process.env.EXPO_PUBLIC_HIVEMQ_BROKER}:${process.env.EXPO_PUBLIC_HIVEMQ_PORT}/mqtt`;
const TOPIC_WILDCARD = 'hfire/#';

let deviceCache = {};

async function refreshDeviceCache() {
  const { data } = await supabase.from('devices').select('mac, profile_id');
  if (data) {
    const newCache = {};
    data.forEach(d => { newCache[d.mac] = d.profile_id; });
    deviceCache = newCache;
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Cache Refreshed`);
  }

  await supabase.from('app_settings').upsert({ 
    key: 'bridge_heartbeat', 
    value: new Date().toISOString(),
    updated_at: new Date().toISOString() 
  });
}

refreshDeviceCache();
setInterval(refreshDeviceCache, 30000);

async function sendPushNotification(ownerId, houseName, alertType, ppm) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token, name')
      .eq('id', ownerId)
      .single();

    if (!profile?.push_token) {
      console.log(`⚠️  [PUSH] No token found for user: ${ownerId}`);
      return;
    }

    console.log(`🔔 [PUSH] Sending Alert to: ${profile.name}`);

    const message = {
      to: profile.push_token,
      sound: 'default',
      title: `🔥 EMERGENCY: ${alertType} DETECTED`,
      body: `${houseName}: Critical level detected (${ppm} PPM). Check the app!`,
      data: { houseName, alertType, ppm },
      priority: 'high',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('✅ [PUSH] Expo Response:', result);
  } catch (error) {
    console.error('❌ [PUSH] Error:', error.message);
  }
}

const client = mqtt.connect(HIVEMQ_URL, {
  username: process.env.EXPO_PUBLIC_HIVEMQ_USERNAME,
  password: process.env.EXPO_PUBLIC_HIVEMQ_PASSWORD,
  clientId: `hfire_bridge_admin_v11_${Math.random().toString(16).slice(2, 10)}`,
});

client.on('connect', () => {
  console.log('✅ [MQTT] Bridge Connected to HiveMQ Cloud');
  client.subscribe([TOPIC_WILDCARD]);
});

const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

function validatePayload(data) {
  if (!data.mac || typeof data.mac !== 'string' || !MAC_REGEX.test(data.mac)) {
    return { valid: false, reason: `Invalid MAC: ${data.mac}` };
  }
  if (data.ppm !== undefined) {
    const ppm = Number(data.ppm);
    if (isNaN(ppm) || ppm < 0 || ppm > 10000) {
      return { valid: false, reason: `Invalid PPM: ${data.ppm}` };
    }
  }
  if (data.flame !== undefined && typeof data.flame !== 'boolean') {
    return { valid: false, reason: `Invalid flame value: ${data.flame}` };
  }
  return { valid: true };
}

client.on('message', (topic, message) => {
  console.log(`\n📩 [MQTT] Message Received | Topic: ${topic}`);
  processMessage(topic, message.toString());
});

async function processMessage(topic, payload) {
  let mac, ppm, flame;
  try {
    const data = JSON.parse(payload);
    const validation = validatePayload(data);
    if (!validation.valid) {
      console.warn(`⚠️  [MQTT] Rejected: ${validation.reason}`);
      return;
    }
    mac = data.mac;
    ppm = Number(data.ppm);
    flame = data.flame === true;
    console.log(`🔍 [MQTT] Data: MAC=${mac}, PPM=${ppm}, FLAME=${flame}`);
  } catch (e) {
    console.warn('⚠️  [MQTT] Rejected non-JSON');
    return; 
  }

  if (!mac) return;

  console.log(`💓 [DB] Heartbeat for ${mac}`);
  await supabase.from('devices').update({ last_seen: new Date().toISOString() }).eq('mac', mac);

  if (ppm !== undefined) {
    let ownerId = deviceCache[mac];
    if (!ownerId) {
      const { data: dev } = await supabase.from('devices').select('profile_id').eq('mac', mac).single();
      if (dev?.profile_id) {
        ownerId = dev.profile_id;
        deviceCache[mac] = ownerId;
      }
    }

    let status = 'Normal';
    let alertType = 'NONE';

    if (flame === true && ppm > 450) {
      status = 'Danger'; alertType = 'FIRE';
    } else if (ppm > 1500) {
      status = 'Danger'; alertType = 'GAS/SMOKE';
    } else if (flame === true || ppm > 450) {
      status = 'Warning'; alertType = flame ? 'FLAME' : 'MODERATE SMOKE';
    }

    console.log(`📊 [DB] Logging Status: ${status}`);
    await supabase.from('gas_logs').insert([{ 
      device_mac: mac, ppm_level: ppm, status, profile_id: ownerId || null
    }]);

    if (status === 'Danger') {
      console.log(`🚨 [ALERT] DANGER! Type: ${alertType}`);
      const { data: device } = await supabase.from('devices').select('house_name').eq('mac', mac).single();
      
      console.log(`📝 [DB] Creating Incident for ${device?.house_name || mac}...`);
      const { data: newIncident, error: insError } = await supabase.from('incidents').insert([{
        device_mac: mac, status: 'Active', ppm_at_trigger: ppm,
        alert_type: alertType, profile_id: ownerId || null
      }]).select().single();

      if (insError) {
        console.error('❌ [DB] Insert Error:', insError.message);
      } else {
        console.log(`✅ [DB] Incident ID #${newIncident.id} is now LIVE!`);
        monitorIncidentResolution(newIncident.id, device?.house_name || mac);
      }

      if (ownerId) {
        await sendPushNotification(ownerId, device?.house_name || 'Home', alertType, ppm);
      }
    }
  }
}

function monitorIncidentResolution(id, location) {
  console.log(`🕵️  [MONITOR] Watching Incident #${id}...`);
  const channel = supabase
    .channel(`resolve_${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'incidents', filter: `id=eq.${id}` },
      (payload) => {
        if (payload.new.status === 'Resolved') {
          console.log(`\n🎉 [RESOLVED] Incident #${id} at ${location} was Acknowledged!`);
          console.log(`🛑 [MONITOR] Alarm cleared.\n`);
          supabase.removeChannel(channel);
        }
      }
    )
    .subscribe();
}

const PORT = process.env.PORT || 8081;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'active', timestamp: new Date().toISOString() }));
}).listen(PORT, () => {
  console.log(`🚀 Health Server on port ${PORT}`);
});
