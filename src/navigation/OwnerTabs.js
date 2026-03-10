import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Buildings, GearSix, QrCode } from 'phosphor-react-native';
import BuildingsScreen from '../screens/owner/BuildingsScreen';
import BuildingDetailScreen from '../screens/owner/BuildingDetailScreen';
import OwnerQrScanScreen from '../screens/owner/OwnerQrScanScreen';
import CreateRoomScreen from '../screens/owner/CreateRoomScreen';
import RoomDetailScreen from '../screens/owner/RoomDetailScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();
const BuildingsStack = createNativeStackNavigator();
const ScanStack = createNativeStackNavigator();

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
      <BuildingsStack.Screen
        name="OwnerQrScan"
        component={OwnerQrScanScreen}
        options={{ title: 'Skanna QR' }}
      />
      <BuildingsStack.Screen
        name="OwnerCreateRoom"
        component={CreateRoomScreen}
        options={{ title: 'Skapa rum' }}
      />
      <BuildingsStack.Screen
        name="OwnerRoomDetail"
        component={RoomDetailScreen}
        options={{ title: 'Rum' }}
      />
    </BuildingsStack.Navigator>
  );
}

function OwnerScanNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen
        name="OwnerQrScan"
        component={OwnerQrScanScreen}
        options={{ title: 'Skanna QR' }}
      />
      <ScanStack.Screen
        name="OwnerCreateRoom"
        component={CreateRoomScreen}
        options={{ title: 'Skapa rum' }}
      />
      <ScanStack.Screen
        name="OwnerRoomDetail"
        component={RoomDetailScreen}
        options={{ title: 'Rum' }}
      />
    </ScanStack.Navigator>
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
        component={OwnerScanNavigator}
        options={{
          title: 'Skanna QR',
          headerShown: false,
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
