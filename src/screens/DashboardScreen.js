import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../components/Text';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';

export default function DashboardScreen({ navigation }) {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text variant="title">Dashboard</Text>
        <Text variant="body" style={styles.copy}>
          Cleaner app shell is ready. Next step is wiring cleaning flows.
        </Text>
        <Button title="Go to Scan Room" onPress={() => navigation.navigate('ScanRoom')} />
        <View style={styles.gap} />
        <Button title="Sign Out" variant="secondary" onPress={signOut} />
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
