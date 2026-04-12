const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key) must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePins() {
  console.log('--- H-Fire PIN Hashing Migration (SHA256) ---');
  
  const { data: settings, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['admin_pin', 'hoa_pin']);

  if (error) {
    console.error('Error fetching settings:', error.message);
    return;
  }

  for (const row of settings) {
    const val = (row.value || '').trim();
    // SHA256 hex string is exactly 64 characters
    const isAlreadySha256 = val.length === 64 && /^[0-9a-f]+$/i.test(val);
    
    if (isAlreadySha256) {
      console.log(`[${row.key}] Already hashed with SHA256. Skipping.`);
      continue;
    }

    console.log(`[${row.key}] Hashing PIN with SHA256...`);
    const hashed = CryptoJS.SHA256(val).toString();

    const { error: updateError } = await supabase
      .from('app_settings')
      .update({ value: hashed, updated_at: new Date().toISOString() })
      .eq('key', row.key);

    if (updateError) {
      console.error(`[${row.key}] Update failed:`, updateError.message);
    } else {
      console.log(`[${row.key}] Successfully hashed.`);
    }
  }

  console.log('Migration complete.');
}

migratePins();
