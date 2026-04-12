const mqtt = require('mqtt');
const dotenv = require('dotenv');

dotenv.config();

const HIVEMQ_URL = `wss://${process.env.EXPO_PUBLIC_HIVEMQ_BROKER}:${process.env.EXPO_PUBLIC_HIVEMQ_PORT}/mqtt`;
const TOPIC = 'hfire/test'; // The bridge listens to hfire/#

const client = mqtt.connect(HIVEMQ_URL, {
  username: process.env.EXPO_PUBLIC_HIVEMQ_USERNAME,
  password: process.env.EXPO_PUBLIC_HIVEMQ_PASSWORD,
  clientId: `hfire_test_sender_${Math.random().toString(16).slice(2, 6)}`,
});

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud');
  
  // FAKE PAYLOAD: High PPM + Flame to trigger Danger alert
  const payload = JSON.stringify({
    mac: 'A1:B2:C3:D4:E5:F1', // Ensure this MAC is in your 'devices' table!
    ppm: 2500,
    flame: true,
    timestamp: new Date().toISOString()
  });

  console.log(`📤 Sending Test Alarm to ${TOPIC}...`);
  console.log(`Payload: ${payload}`);

  client.publish(TOPIC, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to send message:', err);
    } else {
      console.log('🚀 Message sent successfully!');
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('❌ Connection Error:', err);
  process.exit(1);
});
