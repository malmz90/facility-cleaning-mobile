import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../components/Text';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';

export default function ScanRoomScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text variant="title">Skanna rum</Text>
        <Text variant="body" style={styles.copy}>
          Platshållare för QR-skanning. Skannerlogik läggs till i nästa steg.
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
