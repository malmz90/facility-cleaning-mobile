import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Buildings, GearSix, QrCode } from 'phosphor-react-native';
import BuildingsScreen from '../screens/owner/BuildingsScreen';
import BuildingDetailScreen from '../screens/owner/BuildingDetailScreen';
import ScanScreen from '../screens/cleaner/ScanScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();
const BuildingsStack = createNativeStackNavigator();

function BuildingsNavigator() {
  return (
    <BuildingsStack.Navigator>
      <BuildingsStack.Screen
        name="BuildingsList"
        component={BuildingsScreen}
        options={{ title: 'Byggnader' }}
      />
      <BuildingsStack.Screen
        name="BuildingDetail"
        component={BuildingDetailScreen}
        options={{ title: 'Byggnadsdetaljer' }}
      />
    </BuildingsStack.Navigator>
  );
}

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDisabled,
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="OwnerBuildings"
        component={BuildingsNavigator}
        options={{
          title: 'Byggnader',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Buildings size={size} color={color} weight="regular" />,
        }}
      />
      <Tab.Screen
        name="OwnerScanQr"
        component={ScanScreen}
        options={{
          title: 'Skanna QR',
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} weight="regular" />,
        }}
      />
      <Tab.Screen
        name="OwnerSettings"
        component={SettingsScreen}
        options={{
          title: 'Inställningar',
          tabBarIcon: ({ color, size }) => <GearSix size={size} color={color} weight="regular" />,
        }}
      />
    </Tab.Navigator>
  );
}
