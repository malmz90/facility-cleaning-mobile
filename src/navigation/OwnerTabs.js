import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BuildingsScreen from '../screens/owner/BuildingsScreen';
import BuildingDetailScreen from '../screens/owner/BuildingDetailScreen';
import ScanScreen from '../screens/cleaner/ScanScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();
const BuildingsStack = createNativeStackNavigator();

function BuildingsNavigator() {
  return (
    <BuildingsStack.Navigator>
      <BuildingsStack.Screen name="BuildingsList" component={BuildingsScreen} options={{ title: 'Buildings' }} />
      <BuildingsStack.Screen
        name="BuildingDetail"
        component={BuildingDetailScreen}
        options={{ title: 'Building Detail' }}
      />
    </BuildingsStack.Navigator>
  );
}

export default function OwnerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Buildings"
        component={BuildingsNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Scan QR" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
