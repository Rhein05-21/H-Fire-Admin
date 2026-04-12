/**
 * This file exists to satisfy expo-router's file-based routing.
 * The Admin app uses `incidents.tsx` as the incident/history tab instead.
 * This screen redirects automatically to the incidents tab.
 */
import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/(tabs)/incidents" />;
}