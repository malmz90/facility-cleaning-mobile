import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function BuildingDetailScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text variant="title">Byggnadsdetaljer</Text>
        <Text variant="body" style={styles.copy}>
          Platshållare för byggnadsdetaljer i ägar-/adminflödet.
        </Text>
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
    justifyContent: 'center',
    padding: SPACING.x4,
  },
  copy: {
    marginTop: SPACING.x2,
  },
});
