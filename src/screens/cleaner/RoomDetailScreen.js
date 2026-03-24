import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import { fetchRoomInstructions, markRoomAsCleaned } from '../../services/cleaner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

const FREQUENCY_LABELS = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  monthly: 'Månadsvis',
  on_demand: 'Vid behov',
};

export default function RoomDetailScreen({ route, navigation }) {
  const room = route?.params?.room ?? null;
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loadingInstructions, setLoadingInstructions] = useState(true);
  const [instructionError, setInstructionError] = useState('');

  useEffect(() => {
    const loadInstructions = async () => {
      if (!room?.id) {
        setLoadingInstructions(false);
        return;
      }

      setLoadingInstructions(true);
      const { data, error } = await fetchRoomInstructions(room.id);

      if (error) {
        setInstructionError(error.message || 'Kunde inte hämta instruktioner.');
        setInstructions([]);
      } else {
        setInstructionError('');
        setInstructions(data);
        setCheckedItems([]);
      }

      setLoadingInstructions(false);
    };

    loadInstructions();
  }, [room?.id]);

  const checkedCount = checkedItems.length;
  const totalCount = instructions.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;
  const progressPercent = totalCount > 0 ? checkedCount / totalCount : 0;

  const frequencyLabel = useMemo(
    () => FREQUENCY_LABELS[room?.cleaning_frequency] ?? room?.cleaning_frequency ?? '-',
    [room?.cleaning_frequency]
  );

  const toggleChecklistItem = instructionId => {
    setCheckedItems(current =>
      current.includes(instructionId)
        ? current.filter(itemId => itemId !== instructionId)
        : [...current, instructionId]
    );
  };

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
        <View style={styles.errorContainer}>
          <AppText variant="caption" style={styles.errorText}>
            Rumsinformation saknas.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="title">{room.name || 'Namnlöst rum'}</AppText>
          <View style={styles.frequencyBadge}>
            <AppText variant="caption" style={styles.frequencyBadgeText}>
              {frequencyLabel}
            </AppText>
          </View>
        </View>

        {totalCount > 0 ? (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <AppText variant="caption" style={styles.progressLabel}>
                Framsteg
              </AppText>
              <AppText variant="caption" style={styles.progressCount}>
                {checkedCount} av {totalCount}
              </AppText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
            </View>
          </View>
        ) : null}

        <View style={styles.checklistSection}>
          <AppText variant="subtitle" style={styles.checklistTitle}>
            Checklista
          </AppText>

          {loadingInstructions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null}

          {!loadingInstructions && instructionError ? (
            <AppText variant="caption" style={styles.errorText}>
              {instructionError}
            </AppText>
          ) : null}

          {!loadingInstructions && !instructionError && instructions.length === 0 ? (
            <AppText variant="caption" style={styles.emptyText}>
              Inga instruktioner för detta rum.
            </AppText>
          ) : null}

          {!loadingInstructions
            ? instructions.map(item => {
                const isChecked = checkedItems.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleChecklistItem(item.id)}
                    style={({ pressed }) => [
                      styles.checklistItem,
                      isChecked ? styles.checklistItemChecked : null,
                      pressed ? styles.checklistItemPressed : null,
                    ]}
                  >
                    <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : null]}>
                      {isChecked ? <AppText style={styles.checkmark}>✓</AppText> : null}
                    </View>
                    <AppText
                      variant="body"
                      style={[styles.checklistText, isChecked ? styles.checklistTextChecked : null]}
                    >
                      {item.text}
                    </AppText>
                  </Pressable>
                );
              })
            : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {allChecked ? (
          <AppText variant="caption" style={styles.allDoneHint}>
            Alla punkter avklarade — bra jobbat!
          </AppText>
        ) : null}
        <AppButton
          title={submitting ? 'Sparar...' : 'Markera som städat'}
          onPress={handleMarkAsCleaned}
          disabled={submitting || !user?.id}
        />
      </View>
    </SafeAreaView>
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
    paddingBottom: SPACING.x2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.x4,
  },
  header: {
    alignItems: 'flex-start',
    gap: SPACING.x2,
    marginBottom: SPACING.x4,
  },
  frequencyBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x1,
  },
  frequencyBadgeText: {
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginBottom: SPACING.x4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.x2,
  },
  progressLabel: {
    color: COLORS.textSecondary,
  },
  progressCount: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: '100%',
  },
  checklistSection: {
    flex: 1,
  },
  checklistTitle: {
    marginBottom: SPACING.x3,
  },
  loadingWrap: {
    alignItems: 'center',
    padding: SPACING.x4,
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
  checklistItem: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: SPACING.x2,
    padding: SPACING.x3,
  },
  checklistItemChecked: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.primary,
  },
  checklistItemPressed: {
    opacity: 0.7,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: COLORS.borderDefault,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: SPACING.x3,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  checklistText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  checklistTextChecked: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  footer: {
    borderTopColor: COLORS.borderSubtle,
    borderTopWidth: 1,
    gap: SPACING.x2,
    padding: SPACING.x4,
    paddingBottom: SPACING.x3,
  },
  allDoneHint: {
    color: COLORS.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x2,
  },
});
