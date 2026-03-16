import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import { markRoomAsCleaned } from '../../services/cleaner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function RoomDetailScreen({ route, navigation }) {
  const room = route?.params?.room ?? null;
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const instructions = useMemo(() => {
    const value = room?.instructions || '';
    return value.trim();
  }, [room?.instructions]);

  const handleMarkAsCleaned = async () => {
    if (!room?.id || !user?.id || submitting) {
      return;
    }

    setSubmitting(true);
    const { error } = await markRoomAsCleaned({
      roomId: room.id,
      authUserId: user.id,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Fel', error.message || 'Kunde inte markera rummet som städat.');
      return;
    }

    Alert.alert('Klart', '✅ Rum markerat som städat', [
      {
        text: 'OK',
        onPress: () => navigation.popToTop(),
      },
    ]);
  };

  if (!room) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <AppText variant="caption" style={styles.errorText}>
            Rumsinformation saknas.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">{room.name || 'Namnlöst rum'}</AppText>

        <View style={styles.section}>
          <AppText variant="subtitle">Städfrekvens</AppText>
          <AppText variant="body" style={styles.sectionText}>
            {room.cleaning_frequency || '-'}
          </AppText>
        </View>

        {instructions ? (
          <View style={styles.section}>
            <AppText variant="subtitle">Instruktioner</AppText>
            <AppText variant="body" style={styles.sectionText}>
              {instructions}
            </AppText>
          </View>
        ) : null}

        <View style={styles.actionWrap}>
          <AppButton
            title={submitting ? 'Sparar...' : 'Markera som städat'}
            onPress={handleMarkAsCleaned}
            disabled={submitting || !user?.id}
          />
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
  section: {
    marginTop: SPACING.x4,
  },
  sectionText: {
    marginTop: SPACING.x2,
  },
  actionWrap: {
    marginTop: 'auto',
    paddingBottom: SPACING.x2,
  },
  errorText: {
    color: COLORS.error,
  },
});
