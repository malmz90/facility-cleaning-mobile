import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function BuildingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text variant="title">Byggnader</Text>
        <Text variant="body" style={styles.copy}>
          Översikt av byggnader för ägare och administratörer.
        </Text>
        <Button
          title="Öppna byggnadsdetaljer"
          onPress={() => navigation.navigate('BuildingDetail')}
        />
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
    marginBottom: SPACING.x4,
    marginTop: SPACING.x2,
  },
});
