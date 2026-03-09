import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import useAuth from '../../hooks/useAuth';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function SelectOrganizationScreen() {
  const { organizations, setOrganizationId } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Välj organisation</AppText>
        <AppText variant="caption" style={styles.subtitle}>
          Välj vilken organisation du vill arbeta i just nu.
        </AppText>

        <View style={styles.list}>
          {organizations.map(item => (
            <View key={item.organizationId} style={styles.item}>
              <AppText variant="body">Organisation: {item.organizationId}</AppText>
              <AppText variant="caption" style={styles.roleText}>
                Roll: {item.role}
              </AppText>
              <AppButton
                title="Välj"
                onPress={() => setOrganizationId(item.organizationId)}
                variant="secondary"
              />
            </View>
          ))}
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
  subtitle: {
    marginBottom: SPACING.x4,
    marginTop: SPACING.x2,
  },
  list: {
    gap: SPACING.x3,
  },
  item: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  roleText: {
    marginBottom: SPACING.x3,
    marginTop: SPACING.x1,
  },
});
