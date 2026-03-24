import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { fetchRoomById, fetchRoomInstructions } from '../../services/owner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

const FREQUENCY_LABELS = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  monthly: 'Månadsvis',
  on_demand: 'Vid behov',
};

export default function RoomDetailScreen({ route }) {
  const roomId = route?.params?.roomId ?? null;
  const [room, setRoom] = useState(null);
  const [instructions, setInstructions] = useState([]);
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

      const { data: roomInstructions, error: instructionError } = await fetchRoomInstructions(
        data.id
      );
      if (instructionError) {
        setErrorMessage(instructionError.message || 'Kunde inte hämta instruktioner.');
        setLoading(false);
        return;
      }

      setInstructions(roomInstructions);
      setLoading(false);
    };

    loadRoom();
  }, [roomId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const frequencyLabel =
    FREQUENCY_LABELS[room?.cleaning_frequency] ?? room?.cleaning_frequency ?? '-';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">{room.name || 'Namnlöst rum'}</AppText>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <AppText variant="caption" style={styles.badgeText}>
                {frequencyLabel}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="QR-kod" value={room.qr_code_id || '-'} mono />
        </View>

        <View style={styles.instructionSection}>
          <View style={styles.instructionSectionHeader}>
            <AppText variant="subtitle">Checklista</AppText>
            {instructions.length > 0 ? (
              <View style={styles.countBadge}>
                <AppText variant="caption" style={styles.countBadgeText}>
                  {instructions.length}
                </AppText>
              </View>
            ) : null}
          </View>

          {instructions.length === 0 ? (
            <AppText variant="caption" style={styles.emptyCaption}>
              Inga instruktioner tillagda för detta rum.
            </AppText>
          ) : (
            <View style={styles.instructionList}>
              {instructions.map((item, index) => (
                <View key={item.id} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <AppText variant="caption" style={styles.instructionNumberText}>
                      {index + 1}
                    </AppText>
                  </View>
                  <AppText variant="body" style={styles.instructionText}>
                    {item.text}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" style={styles.infoRowLabel}>
        {label}
      </AppText>
      <AppText
        variant="body"
        style={[styles.infoRowValue, mono ? styles.infoRowValueMono : null]}
        numberOfLines={1}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.x4,
    paddingBottom: SPACING.x8,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.x4,
  },
  header: {
    marginBottom: SPACING.x4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.x2,
    marginTop: SPACING.x2,
  },
  badge: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x1,
  },
  badgeText: {
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: SPACING.x3,
    overflow: 'hidden',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x3,
  },
  infoRowLabel: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoRowValue: {
    color: COLORS.textPrimary,
    flex: 2,
    fontWeight: '600',
    textAlign: 'right',
  },
  infoRowValueMono: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  instructionSection: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  instructionSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.x2,
    marginBottom: SPACING.x3,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  emptyCaption: {
    color: COLORS.textSecondary,
  },
  instructionList: {
    gap: SPACING.x2,
  },
  instructionItem: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundPrimary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.x3,
    padding: SPACING.x3,
  },
  instructionNumber: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  instructionNumberText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  instructionText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
  },
});
