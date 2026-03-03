import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ScanRoomScreen from '../screens/ScanRoomScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ScanRoom" component={ScanRoomScreen} options={{ title: 'Scan Room' }} />
    </Stack.Navigator>
  );
}
