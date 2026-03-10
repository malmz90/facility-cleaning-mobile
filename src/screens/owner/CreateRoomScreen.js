import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import useBuildings from '../../hooks/useBuildings';
import { createRoom, fetchRoomByQrCode } from '../../services/owner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly', 'on_demand'];

export default function CreateRoomScreen({ route, navigation }) {
  const { organizationId: authOrganizationId } = useAuth();
  const qrCodeId = route?.params?.qrCodeId ?? '';
  const buildingFromRoute = route?.params?.building ?? null;
  const organizationId = route?.params?.organizationId || authOrganizationId;
  const { buildings, loading: buildingsLoading } = useBuildings(organizationId);

  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cleaningFrequency, setCleaningFrequency] = useState('weekly');
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingFromRoute?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!selectedBuildingId && buildings.length > 0) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  const selectedBuildingName = useMemo(() => {
    if (!selectedBuildingId) {
      return '';
    }
    const selected = buildings.find(item => item.id === selectedBuildingId);
    return selected?.name ?? '';
  }, [buildings, selectedBuildingId]);

  const handleSave = async () => {
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
      instructions: instructions.trim(),
      cleaningFrequency,
      qrCodeId,
    });

    if (error) {
      setSaving(false);
      setErrorMessage(error.message || 'Kunde inte skapa rum.');
      return;
    }

    setSaving(false);
    navigation.replace('OwnerRoomDetail', { roomId: createdRoom.id });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText variant="title">Skapa rum</AppText>
        <AppText variant="caption" style={styles.subtitle}>
          QR-kod: {qrCodeId}
        </AppText>

        <AppInput label="Rumsnamn" value={name} onChangeText={setName} placeholder="Ex. Konferensrum 1" />
        <View style={styles.gap} />
        <AppInput
          label="Instruktioner (valfritt)"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Ex. Töm papperskorg, torka bord"
          multiline
        />

        <AppText variant="subtitle" style={styles.sectionTitle}>
          Städintervall
        </AppText>
        <View style={styles.optionList}>
          {FREQUENCY_OPTIONS.map(option => (
            <Pressable
              key={option}
              onPress={() => setCleaningFrequency(option)}
              style={[
                styles.optionItem,
                cleaningFrequency === option ? styles.optionItemActive : null,
              ]}
            >
              <AppText variant="caption">{option}</AppText>
            </Pressable>
          ))}
        </View>

        <AppText variant="subtitle" style={styles.sectionTitle}>
          Byggnad
        </AppText>
        {buildingsLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <View style={styles.optionList}>
            {buildings.map(item => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedBuildingId(item.id)}
                style={[
                  styles.optionItem,
                  selectedBuildingId === item.id ? styles.optionItemActive : null,
                ]}
              >
                <AppText variant="caption">{item.name}</AppText>
              </Pressable>
            ))}
          </View>
        )}

        {selectedBuildingName ? (
          <AppText variant="caption" style={styles.selectedText}>
            Vald byggnad: {selectedBuildingName}
          </AppText>
        ) : null}

        {errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}

        <View style={styles.buttonWrap}>
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

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  container: {
    padding: SPACING.x4,
    paddingBottom: SPACING.x6,
  },
  subtitle: {
    marginBottom: SPACING.x4,
    marginTop: SPACING.x2,
  },
  gap: {
    height: SPACING.x3,
  },
  sectionTitle: {
    marginBottom: SPACING.x2,
    marginTop: SPACING.x4,
  },
  optionList: {
    gap: SPACING.x2,
  },
  optionItem: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.x3,
  },
  optionItemActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  selectedText: {
    marginTop: SPACING.x2,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x3,
  },
  buttonWrap: {
    marginTop: SPACING.x4,
  },
});
