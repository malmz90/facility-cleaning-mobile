import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Text from '../components/Text';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const { error } = await signIn({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message || 'Sign in failed.');
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
          <Text variant="title">Welcome</Text>
          <Text variant="caption" style={styles.subtitle}>
            Sign in to continue
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.gap} />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {errorMessage ? (
            <Text variant="caption" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.buttonWrap}>
            <Button
              title={submitting ? 'Signing In...' : 'Sign In'}
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
