import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZES } from '../theme/typography';

export default function Button({ title, onPress, disabled, variant = 'primary' }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled ? styles[`${variant}Pressed`] : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: SPACING.x4,
    paddingVertical: SPACING.x3,
  },
  text: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryPressed,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  secondaryPressed: {
    backgroundColor: COLORS.secondaryPressed,
  },
  accent: {
    backgroundColor: COLORS.accent,
  },
  accentPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  disabled: {
    opacity: 0.5,
  },
});
