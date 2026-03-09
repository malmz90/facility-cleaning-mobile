import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppInput from '../../components/AppInput';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import useAuth from '../../hooks/useAuth';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage('Fyll i både e-post och lösenord.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const { error } = await signIn({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message || 'Inloggningen misslyckades.');
    }

    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <AppText variant="title">Välkommen</AppText>
          <AppText variant="caption" style={styles.subtitle}>
            Logga in för att fortsätta
          </AppText>

          <AppInput
            label="E-post"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.gap} />
          <AppInput
            label="Lösenord"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {errorMessage ? (
            <AppText variant="caption" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}

          <View style={styles.buttonWrap}>
            <AppButton
              title={submitting ? 'Loggar in...' : 'Logga in'}
              onPress={handleSignIn}
              disabled={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.x4,
  },
  subtitle: {
    marginBottom: SPACING.x5,
    marginTop: SPACING.x2,
  },
  gap: {
    height: SPACING.x3,
  },
  buttonWrap: {
    marginTop: SPACING.x4,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x3,
  },
});
