import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScanScreen from '../screens/cleaner/ScanScreen';
import HistoryScreen from '../screens/cleaner/HistoryScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function CleanerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
