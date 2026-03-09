import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import useAuth from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';

export default function DashboardScreen({ navigation }) {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Översikt</AppText>
        <AppText variant="body" style={styles.copy}>
          Stommarna för städappen är redo. Nästa steg är att koppla städflöden.
        </AppText>
        <AppButton title="Gå till rumsskanning" onPress={() => navigation.navigate('ScanRoom')} />
        <View style={styles.gap} />
        <AppButton title="Logga ut" variant="secondary" onPress={signOut} />
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
    justifyContent: 'center',
    padding: SPACING.x4,
  },
  copy: {
    marginBottom: SPACING.x5,
    marginTop: SPACING.x2,
  },
  gap: {
    height: SPACING.x3,
  },
});
