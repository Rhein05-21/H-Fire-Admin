const { execSync } = require('child_process');
try {
  const config = execSync('npx expo config --json', { encoding: 'utf-8' });
  const parsed = JSON.parse(config);
  const androidKey = parsed.expo.android?.config?.googleMaps?.apiKey;
  const iosKey = parsed.expo.ios?.config?.googleMapsApiKey;
  
  console.log('Android API Key present:', !!androidKey);
  console.log('iOS API Key present:', !!iosKey);
  
  if (!androidKey) {
    console.log('Warning: Android Google Maps API Key is missing in the resolved config!');
  }
} catch (e) {
  console.error('Error reading expo config:', e.message);
}
