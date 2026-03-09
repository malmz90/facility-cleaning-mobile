import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import useAuth from '../../hooks/useAuth';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function SettingsScreen() {
  const { user, role, organizationId, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Inställningar</AppText>
        <AppText variant="caption" style={styles.info}>
          Användare: {user?.email ?? '-'}
        </AppText>
        <AppText variant="caption" style={styles.info}>
          Roll: {role ?? '-'}
        </AppText>
        <AppText variant="caption" style={styles.info}>
          Organisation: {organizationId ?? '-'}
        </AppText>

        <View style={styles.buttonWrap}>
          <AppButton title="Logga ut" variant="secondary" onPress={signOut} />
        </View>
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
  info: {
    marginTop: SPACING.x2,
  },
  buttonWrap: {
    marginTop: SPACING.x5,
  },
});
