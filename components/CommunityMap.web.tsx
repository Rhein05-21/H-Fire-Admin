import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style }: any) => (
  <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }]}>
    <Text style={{ color: '#fff' }}>Maps are not available on Web</Text>
    {children}
  </View>
);

export const Marker = ({ children }: any) => <View>{children}</View>;
export const Callout = ({ children }: any) => <View>{children}</View>;
export const PROVIDER_GOOGLE = 'google';

export default MapView;
