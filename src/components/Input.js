import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Text from './Text';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES } from '../theme/typography';

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, ...props }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          secureTextEntry={isPassword && !passwordVisible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setPasswordVisible(prev => !prev)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Text style={styles.eyeIcon}>{passwordVisible ? '👁' : '🙈'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: SPACING.x2,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderDefault,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: SPACING.x3,
  },
  inputRowFocused: {
    borderColor: COLORS.borderFocus,
  },
  input: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: FONT_SIZES.body,
    paddingVertical: SPACING.x3,
  },
  eyeButton: {
    paddingLeft: SPACING.x2,
  },
  eyeIcon: {
    fontSize: 18,
  },
});
