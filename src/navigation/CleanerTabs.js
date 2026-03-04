import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClockCounterClockwise, GearSix, QrCode } from 'phosphor-react-native';
import ScanScreen from '../screens/cleaner/ScanScreen';
import HistoryScreen from '../screens/cleaner/HistoryScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function CleanerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDisabled,
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="CleanerScan"
        component={ScanScreen}
        options={{
          title: 'Skanna',
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} weight="regular" />,
        }}
      />
      <Tab.Screen
        name="CleanerHistory"
        component={HistoryScreen}
        options={{
          title: 'Historik',
          tabBarIcon: ({ color, size }) => (
            <ClockCounterClockwise size={size} color={color} weight="regular" />
          ),
        }}
      />
      <Tab.Screen
        name="CleanerSettings"
        component={SettingsScreen}
        options={{
          title: 'Inställningar',
          tabBarIcon: ({ color, size }) => <GearSix size={size} color={color} weight="regular" />,
        }}
      />
    </Tab.Navigator>
  );
}
