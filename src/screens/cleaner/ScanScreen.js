import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import { fetchRoomByScannedQr } from '../../services/cleaner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function ScanScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);
  const processingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setChecking(false);
      processingRef.current = false;
      return () => {
        setScanned(true);
      };
    }, [])
  );

  const resetScanner = () => {
    setScanned(false);
    setChecking(false);
    processingRef.current = false;
  };

  const processQrCode = async qrCodeId => {
    if (!qrCodeId) {
      resetScanner();
      return;
    }

    const { data: room, error } = await fetchRoomByScannedQr(qrCodeId);

    if (error) {
      Alert.alert('Fel', 'Kunde inte läsa QR-kod just nu. Försök igen.');
      resetScanner();
      return;
    }

    if (!room) {
      Alert.alert('Rum hittades inte', 'Detta QR-rum finns inte i systemet.');
      resetScanner();
      return;
    }

    navigation.navigate('CleanerRoomDetail', { room });
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
            Tillåt kamera för att skanna rum.
          </AppText>
          <AppButton title="Ge kameraåtkomst" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Skanna rum</AppText>
        <AppText variant="caption" style={styles.subtitle}>
          Rikta kameran mot rummets QR-kod.
        </AppText>

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
          Håll QR-koden i rutan
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
          <View style={styles.actionWrap}>
            <AppButton title="Skanna igen" onPress={resetScanner} variant="secondary" />
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
  actionWrap: {
    marginTop: SPACING.x3,
  },
});
