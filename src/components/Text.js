import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { FONT_SIZES } from '../theme/typography';

const variantMap = StyleSheet.create({
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.h2,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
  },
  body: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
  },
  caption: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
});

export default function Text({ children, variant = 'body', style, ...props }) {
  return (
    <RNText style={[variantMap[variant], style]} {...props}>
      {children}
    </RNText>
  );
}
