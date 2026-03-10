import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { fetchRoomById } from '../../services/owner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function RoomDetailScreen({ route }) {
  const roomId = route?.params?.roomId ?? null;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setErrorMessage('Saknar rum.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await fetchRoomById(roomId);
      if (error) {
        setErrorMessage(error.message || 'Kunde inte hämta rum.');
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage('Rummet hittades inte.');
        setLoading(false);
        return;
      }

      setRoom(data);
      setLoading(false);
    };

    loadRoom();
  }, [roomId]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : null}

        {!loading && errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}

        {!loading && room ? (
          <View style={styles.content}>
            <AppText variant="title">{room.name || 'Namnlöst rum'}</AppText>
            <AppText variant="caption" style={styles.line}>
              Frekvens: {room.cleaning_frequency || '-'}
            </AppText>
            <AppText variant="caption" style={styles.line}>
              QR: {room.qr_code_id || '-'}
            </AppText>
            <AppText variant="caption" style={styles.line}>
              Instruktioner: {room.instructions || '-'}
            </AppText>
          </View>
        ) : null}
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
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  line: {
    marginTop: SPACING.x2,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x3,
  },
});
