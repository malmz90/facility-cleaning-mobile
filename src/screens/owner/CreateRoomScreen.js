import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import useBuildings from '../../hooks/useBuildings';
import { createRoom, createRoomInstructions, fetchRoomByQrCode } from '../../services/owner.service';
import { COLORS } from '../../theme/colors';
import { FONT_SIZES } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Dagligen', description: 'Varje dag' },
  { value: 'weekly', label: 'Veckovis', description: 'En gång i veckan' },
  { value: 'monthly', label: 'Månadsvis', description: 'En gång i månaden' },
  { value: 'on_demand', label: 'Vid behov', description: 'Städas vid behov' },
];

export default function CreateRoomScreen({ route, navigation }) {
  const { organizationId: authOrganizationId } = useAuth();
  const qrCodeId = route?.params?.qrCodeId ?? '';
  const buildingFromRoute = route?.params?.building ?? null;
  const organizationId = route?.params?.organizationId || authOrganizationId;
  const { buildings, loading: buildingsLoading } = useBuildings(organizationId);
  const instructionInputRef = useRef(null);

  const [name, setName] = useState('');
  const [instructionInput, setInstructionInput] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [cleaningFrequency, setCleaningFrequency] = useState('weekly');
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingFromRoute?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!selectedBuildingId && buildings.length > 0) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  const selectedBuildingName = useMemo(() => {
    if (!selectedBuildingId) return '';
    const selected = buildings.find(item => item.id === selectedBuildingId);
    return selected?.name ?? '';
  }, [buildings, selectedBuildingId]);

  const selectedFrequencyLabel = useMemo(() => {
    const selected = FREQUENCY_OPTIONS.find(option => option.value === cleaningFrequency);
    return selected?.label ?? cleaningFrequency;
  }, [cleaningFrequency]);

  const normalizedInstructions = useMemo(
    () => instructions.map(item => item.trim()).filter(Boolean),
    [instructions]
  );

  const handleContinueToConfirmation = () => {
    if (!name.trim()) {
      setErrorMessage('Ange rumsnamn.');
      return;
    }
    if (!selectedBuildingId) {
      setErrorMessage('Välj byggnad.');
      return;
    }
    if (!organizationId) {
      setErrorMessage('Organisation saknas.');
      return;
    }
    setErrorMessage('');
    setConfirming(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');

    const { data: existingRoom, error: lookupError } = await fetchRoomByQrCode(qrCodeId);
    if (lookupError) {
      setSaving(false);
      setErrorMessage(lookupError.message || 'Kunde inte kontrollera QR-kod.');
      return;
    }
    if (existingRoom) {
      setSaving(false);
      navigation.replace('OwnerRoomDetail', { roomId: existingRoom.id });
      return;
    }

    const { data: createdRoom, error } = await createRoom({
      organizationId,
      buildingId: selectedBuildingId,
      name: name.trim(),
      cleaningFrequency,
      qrCodeId,
    });
    if (error) {
      setSaving(false);
      setErrorMessage(error.message || 'Kunde inte skapa rum.');
      return;
    }

    const { error: instructionError } = await createRoomInstructions({
      roomId: createdRoom.id,
      instructions: normalizedInstructions,
    });
    if (instructionError) {
      setSaving(false);
      setErrorMessage(instructionError.message || 'Kunde inte spara instruktioner.');
      return;
    }

    setSaving(false);
    navigation.replace('OwnerRoomDetail', { roomId: createdRoom.id });
  };

  const handleAddInstruction = () => {
    const trimmed = instructionInput.trim();
    if (!trimmed) return;
    if (instructions.some(item => item.toLowerCase() === trimmed.toLowerCase())) return;
    setInstructions(current => [...current, trimmed]);
    setInstructionInput('');
    instructionInputRef.current?.focus();
  };

  const handleRemoveInstruction = indexToRemove => {
    setInstructions(current => current.filter((_, index) => index !== indexToRemove));
  };

  if (confirming) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <AppText variant="title">Granska rum</AppText>
          <AppText variant="caption" style={styles.pageSubtitle}>
            Kontrollera att allt stämmer innan du sparar.
          </AppText>

          <View style={styles.summaryCard}>
            <SummaryRow label="Rumsnamn" value={name.trim()} />
            <SummaryDivider />
            <SummaryRow label="Byggnad" value={selectedBuildingName || '-'} />
            <SummaryDivider />
            <SummaryRow label="Städintervall" value={selectedFrequencyLabel} />
            <SummaryDivider />
            <SummaryRow label="QR-kod" value={qrCodeId} mono />
          </View>

          <View style={styles.summaryInstructionSection}>
            <View style={styles.summaryInstructionHeader}>
              <AppText variant="subtitle">Checklista</AppText>
              <View style={styles.countBadge}>
                <AppText variant="caption" style={styles.countBadgeText}>
                  {normalizedInstructions.length}
                </AppText>
              </View>
            </View>

            {normalizedInstructions.length === 0 ? (
              <AppText variant="caption" style={styles.emptyCaption}>
                Inga instruktioner tillagda.
              </AppText>
            ) : (
              normalizedInstructions.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.summaryInstructionItem}>
                  <View style={styles.summaryInstructionNumber}>
                    <AppText variant="caption" style={styles.summaryInstructionNumberText}>
                      {index + 1}
                    </AppText>
                  </View>
                  <AppText variant="body" style={styles.summaryInstructionText}>
                    {item}
                  </AppText>
                </View>
              ))
            )}
          </View>

          {errorMessage ? (
            <AppText variant="caption" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}

          <View style={styles.confirmActions}>
            <AppButton
              title="Tillbaka och redigera"
              onPress={() => setConfirming(false)}
              variant="secondary"
              disabled={saving}
            />
            <View style={styles.confirmActionGap} />
            <AppButton
              title={saving ? 'Sparar...' : 'Spara rum'}
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title">Skapa rum</AppText>
        <View style={styles.qrChip}>
          <AppText variant="caption" style={styles.qrChipText}>
            QR: {qrCodeId}
          </AppText>
        </View>

        <SectionCard title="Rumsnamn">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Konferensrum 1"
            placeholderTextColor={COLORS.textDisabled}
            style={styles.nameInput}
            returnKeyType="done"
          />
        </SectionCard>

        <SectionCard title="Instruktioner (checklista)">
          <View style={styles.instructionInputRow}>
            <TextInput
              ref={instructionInputRef}
              value={instructionInput}
              onChangeText={setInstructionInput}
              placeholder="Lägg till en instruktion..."
              placeholderTextColor={COLORS.textDisabled}
              style={styles.instructionTextInput}
              onSubmitEditing={handleAddInstruction}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Pressable
              onPress={handleAddInstruction}
              style={({ pressed }) => [
                styles.addInstructionButton,
                pressed ? styles.addInstructionButtonPressed : null,
              ]}
            >
              <AppText style={styles.addInstructionButtonText}>+</AppText>
            </Pressable>
          </View>

          {instructions.length === 0 ? (
            <AppText variant="caption" style={styles.emptyCaption}>
              Inga instruktioner tillagda ännu.
            </AppText>
          ) : (
            <View style={styles.instructionList}>
              {instructions.map((instruction, index) => (
                <View key={`${instruction}-${index}`} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <AppText variant="caption" style={styles.instructionNumberText}>
                      {index + 1}
                    </AppText>
                  </View>
                  <AppText variant="body" style={styles.instructionItemText}>
                    {instruction}
                  </AppText>
                  <Pressable
                    onPress={() => handleRemoveInstruction(index)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed ? styles.removeButtonPressed : null,
                    ]}
                  >
                    <AppText style={styles.removeButtonText}>×</AppText>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Städintervall">
          <View style={styles.optionGrid}>
            {FREQUENCY_OPTIONS.map(option => {
              const isActive = cleaningFrequency === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setCleaningFrequency(option.value)}
                  style={[styles.frequencyOption, isActive ? styles.frequencyOptionActive : null]}
                >
                  <View style={styles.frequencyOptionRow}>
                    <View style={[styles.radioCircle, isActive ? styles.radioCircleActive : null]}>
                      {isActive ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View>
                      <AppText
                        variant="caption"
                        style={[
                          styles.frequencyLabel,
                          isActive ? styles.frequencyLabelActive : null,
                        ]}
                      >
                        {option.label}
                      </AppText>
                      <AppText variant="caption" style={styles.frequencyDescription}>
                        {option.description}
                      </AppText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard title="Byggnad">
          {buildingsLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <View style={styles.buildingList}>
              {buildings.map(item => {
                const isActive = selectedBuildingId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedBuildingId(item.id)}
                    style={[styles.buildingOption, isActive ? styles.buildingOptionActive : null]}
                  >
                    <View style={[styles.radioCircle, isActive ? styles.radioCircleActive : null]}>
                      {isActive ? <View style={styles.radioDot} /> : null}
                    </View>
                    <AppText
                      variant="body"
                      style={[
                        styles.buildingOptionText,
                        isActive ? styles.buildingOptionTextActive : null,
                      ]}
                    >
                      {item.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </SectionCard>

        {errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}

        <View style={styles.buttonWrap}>
          <AppButton title="Granska innan spara →" onPress={handleContinueToConfirmation} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <AppText variant="subtitle" style={styles.sectionCardTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function SummaryRow({ label, value, mono = false }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="caption" style={styles.summaryRowLabel}>
        {label}
      </AppText>
      <AppText
        variant="body"
        style={[styles.summaryRowValue, mono ? styles.summaryRowValueMono : null]}
        numberOfLines={1}
      >
        {value}
      </AppText>
    </View>
  );
}

function SummaryDivider() {
  return <View style={styles.summaryDivider} />;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  container: {
    padding: SPACING.x4,
    paddingBottom: SPACING.x8,
  },
  pageSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.x4,
    marginTop: SPACING.x2,
  },
  qrChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: SPACING.x4,
    marginTop: SPACING.x2,
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x1,
  },
  qrChipText: {
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  sectionCard: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: SPACING.x3,
    padding: SPACING.x3,
  },
  sectionCardTitle: {
    marginBottom: SPACING.x3,
  },
  nameInput: {
    backgroundColor: COLORS.backgroundPrimary,
    borderColor: COLORS.borderDefault,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    minHeight: 48,
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x3,
  },
  instructionInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.x2,
    marginBottom: SPACING.x3,
  },
  instructionTextInput: {
    backgroundColor: COLORS.backgroundPrimary,
    borderColor: COLORS.borderDefault,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: FONT_SIZES.body,
    minHeight: 48,
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x3,
  },
  addInstructionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addInstructionButtonPressed: {
    backgroundColor: COLORS.primaryPressed,
  },
  addInstructionButtonText: {
    color: COLORS.textInverse,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 28,
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
    gap: SPACING.x2,
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
  instructionItemText: {
    flex: 1,
  },
  removeButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  removeButtonPressed: {
    opacity: 0.5,
  },
  removeButtonText: {
    color: COLORS.error,
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 26,
  },
  emptyCaption: {
    color: COLORS.textSecondary,
    marginTop: SPACING.x1,
  },
  optionGrid: {
    gap: SPACING.x2,
  },
  frequencyOption: {
    backgroundColor: COLORS.backgroundPrimary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  frequencyOptionActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  frequencyOptionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.x3,
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: COLORS.borderDefault,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  frequencyLabel: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  frequencyLabelActive: {
    color: COLORS.primary,
  },
  frequencyDescription: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buildingList: {
    gap: SPACING.x2,
  },
  buildingOption: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundPrimary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.x3,
    padding: SPACING.x3,
  },
  buildingOptionActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  buildingOptionText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  buildingOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.x3,
    marginTop: SPACING.x1,
  },
  buttonWrap: {
    marginTop: SPACING.x2,
  },
  summaryCard: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: SPACING.x3,
    overflow: 'hidden',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.x3,
    paddingVertical: SPACING.x3,
  },
  summaryRowLabel: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  summaryRowValue: {
    color: COLORS.textPrimary,
    flex: 2,
    fontWeight: '600',
    textAlign: 'right',
  },
  summaryRowValueMono: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  summaryDivider: {
    backgroundColor: COLORS.borderSubtle,
    height: 1,
    marginHorizontal: SPACING.x3,
  },
  summaryInstructionSection: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: SPACING.x3,
    padding: SPACING.x3,
  },
  summaryInstructionHeader: {
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
  summaryInstructionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.x3,
    marginBottom: SPACING.x2,
  },
  summaryInstructionNumber: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  summaryInstructionNumberText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryInstructionText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  confirmActions: {
    marginTop: SPACING.x2,
  },
  confirmActionGap: {
    height: SPACING.x2,
  },
});
