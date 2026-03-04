import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import Button from '../../components/Button';
import useAuth from '../../hooks/useAuth';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function SettingsScreen() {
  const { user, role, organizationId, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text variant="title">Inställningar</Text>
        <Text variant="caption" style={styles.info}>
          Användare: {user?.email ?? '-'}
        </Text>
        <Text variant="caption" style={styles.info}>
          Roll: {role ?? '-'}
        </Text>
        <Text variant="caption" style={styles.info}>
          Organisation: {organizationId ?? '-'}
        </Text>

        <View style={styles.buttonWrap}>
          <Button title="Logga ut" variant="secondary" onPress={signOut} />
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
