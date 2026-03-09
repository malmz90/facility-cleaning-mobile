import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import useBuildings from '../../hooks/useBuildings';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function BuildingsScreen({ navigation }) {
  const { organizationId } = useAuth();
  const { buildings, loading, errorMessage } = useBuildings(organizationId);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Byggnader</AppText>

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
            {buildings.length === 0 ? (
              <AppText variant="caption">Inga byggnader hittades för den här organisationen.</AppText>
            ) : null}

            {buildings.map(building => (
              <Pressable
                key={building.id}
                onPress={() => navigation.navigate('BuildingDetail', { building })}
                style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
              >
                <AppText variant="subtitle">🏢 {building.name || 'Namnlös byggnad'}</AppText>
                <AppText variant="caption" style={styles.address}>
                  {building.address || 'Adress saknas'}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundSecondary,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.x4,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    gap: SPACING.x2,
    marginTop: SPACING.x3,
    paddingBottom: SPACING.x4,
  },
  item: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  itemPressed: {
    backgroundColor: COLORS.backgroundSecondaryPressed,
  },
  address: {
    marginTop: SPACING.x1,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x3,
  },
});
