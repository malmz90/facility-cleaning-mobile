import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Historik</AppText>
        <AppText variant="body" style={styles.copy}>
          Platshållare för städhistorik för städare.
        </AppText>
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
