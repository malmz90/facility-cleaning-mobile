import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import useAuth from '../../hooks/useAuth';
import useRooms from '../../hooks/useRooms';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function BuildingDetailScreen({ route, navigation }) {
  const building = route?.params?.building ?? null;
  const { organizationId } = useAuth();
  const { rooms, loading, errorMessage } = useRooms({
    buildingId: building?.id,
    organizationId,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: building?.name || 'Byggnadsdetaljer',
    });
  }, [building?.name, navigation]);

  const handleAddRoomPress = () => {
    Alert.alert('Kommer snart', 'QR scanning will be implemented here later');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">{building?.name || 'Byggnad'}</AppText>

        <View style={styles.buttonWrap}>
          <AppButton title="Add Room (Scan QR)" onPress={handleAddRoomPress} />
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : null}

        {!loading && errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}

        {!loading && !errorMessage ? (
          <ScrollView contentContainerStyle={styles.list}>
            {rooms.length === 0 ? (
              <AppText variant="caption">
                No rooms yet. Add Room (Scan QR) to create the first room.
              </AppText>
            ) : null}
            {rooms.map(room => (
              <View key={room.id} style={styles.item}>
                <AppText variant="subtitle">{room.name || 'Namnlöst rum'}</AppText>
                <AppText variant="caption" style={styles.itemCaption}>
                  Frekvens: {room.cleaning_frequency || 'ej satt'}
                </AppText>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.x4,
  },
  buttonWrap: {
    marginTop: SPACING.x3,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    gap: SPACING.x2,
    marginTop: SPACING.x4,
    paddingBottom: SPACING.x4,
  },
  item: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  itemCaption: {
    marginTop: SPACING.x1,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x3,
  },
});
