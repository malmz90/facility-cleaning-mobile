import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import { fetchRoomByQrCode } from '../../services/owner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function OwnerQrScanScreen({ route, navigation }) {
  const building = route?.params?.building ?? null;
  const { organizationId } = useAuth();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const processingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setChecking(false);
      setManualEntryVisible(false);
      setManualQrCode('');
      processingRef.current = false;
      return () => {
        // Unmount camera scanner handlers while screen is unfocused.
        setScanned(true);
      };
    }, [])
  );

  const processQrCode = async qrCodeId => {
    if (!qrCodeId) {
      setChecking(false);
      setScanned(false);
      processingRef.current = false;
      return;
    }

    const { data: existingRoom, error } = await fetchRoomByQrCode(qrCodeId);

    if (error) {
      setChecking(false);
      setScanned(false);
      processingRef.current = false;
      return;
    }

    if (existingRoom) {
      navigation.navigate('OwnerRoomDetail', { roomId: existingRoom.id });
      return;
    }

    navigation.navigate('OwnerCreateRoom', {
      qrCodeId,
      building,
      organizationId,
    });
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || checking || processingRef.current) {
      return;
    }

    setScanned(true);
    setChecking(true);
    processingRef.current = true;

    const qrCodeId = String(data || '').trim();
    await processQrCode(qrCodeId);
  };

  const handleManualSubmit = async () => {
    const qrCodeId = manualQrCode.trim();
    if (!qrCodeId || checking || processingRef.current) {
      return;
    }

    setScanned(true);
    setChecking(true);
    processingRef.current = true;
    await processQrCode(qrCodeId);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <AppText variant="title">Kameraåtkomst krävs</AppText>
          <AppText variant="caption" style={styles.subtitle}>
            Tillåt kamera för att skanna QR-kod till rum.
          </AppText>
          <AppButton title="Ge kameraåtkomst" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Skanna QR för att lägga till rum</AppText>
        {building?.name ? (
          <AppText variant="caption" style={styles.subtitle}>
            Byggnad: {building.name}
          </AppText>
        ) : (
          <AppText variant="caption" style={styles.subtitle}>
            Skanna QR-kod för att hitta eller skapa rum.
          </AppText>
        )}

        <View style={styles.cameraWrap}>
          {isFocused ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned || checking ? undefined : handleBarCodeScanned}
            />
          ) : (
            <View style={styles.cameraInactive} />
          )}
          <View pointerEvents="none" style={styles.overlay}>
            <View style={styles.scanBox} />
          </View>
        </View>

        <AppText variant="caption" style={styles.helperText}>
          Hall QR-koden i rutan
        </AppText>

        {checking ? (
          <View style={styles.checkingWrap}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <AppText variant="caption" style={styles.checkingText}>
              Kontrollerar QR-kod...
            </AppText>
          </View>
        ) : null}

        {scanned && !checking ? (
          <AppButton title="Skanna igen" onPress={() => setScanned(false)} variant="secondary" />
        ) : null}

        <View style={styles.manualWrap}>
          {!manualEntryVisible ? (
            <AppButton
              title="Kan inte scanna? Ange kod"
              onPress={() => setManualEntryVisible(true)}
              variant="secondary"
            />
          ) : (
            <>
              <AppInput
                label="QR-kod ID"
                value={manualQrCode}
                onChangeText={setManualQrCode}
                placeholder="Ange QR-kod"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.manualActions}>
                <AppButton title="Anvand kod" onPress={handleManualSubmit} disabled={checking} />
              </View>
            </>
          )}
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
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginBottom: SPACING.x3,
    marginTop: SPACING.x2,
  },
  camera: {
    borderRadius: 12,
    height: 320,
    overflow: 'hidden',
  },
  cameraWrap: {
    position: 'relative',
  },
  cameraInactive: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    height: 320,
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scanBox: {
    borderColor: COLORS.overlayBorder,
    borderRadius: 12,
    borderWidth: 2,
    height: 180,
    width: 180,
  },
  helperText: {
    marginTop: SPACING.x2,
    textAlign: 'center',
  },
  checkingWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.x3,
  },
  checkingText: {
    marginLeft: SPACING.x2,
  },
  manualWrap: {
    marginTop: SPACING.x3,
  },
  manualActions: {
    marginTop: SPACING.x2,
  },
});
