import { useAdminAuth } from '@/context/AdminAuthContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('@/assets/images/h-fire_logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#E53935" style={styles.loader} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#0a0a0a'
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20
  },
  loader: {
    marginTop: 10
  }
});
