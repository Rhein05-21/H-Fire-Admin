import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ADMIN_TINT = '#E53935'; // Red for admin

export default function AdminTabLayout() {
  const { colorScheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0f0f0f' : '#ffffff';
  const shadowColor = isDark ? '#000' : '#888';

  // Base height for the tab bar content (icons/labels)
  const TAB_BAR_CONTENT_HEIGHT = 60;
  // Use insets.bottom if it exists, otherwise use a default padding
  const bottomPadding = Math.max(insets.bottom, 15);
  const totalHeight = TAB_BAR_CONTENT_HEIGHT + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ADMIN_TINT,
        tabBarInactiveTintColor: isDark ? '#555' : '#888',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor,
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -5 },
          height: totalHeight,
          paddingBottom: bottomPadding,
          paddingTop: 12,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          borderWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          marginTop: -4,
          letterSpacing: 0.5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="waveform.path.ecg" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'MAP',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: 'INCIDENTS',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="exclamationmark.triangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
