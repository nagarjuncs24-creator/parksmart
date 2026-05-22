import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 40 }: GlassCardProps) => {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.container, style]}>
      <View style={styles.innerContainer}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.medium,
  },
  innerContainer: {
    padding: 16,
  },
});
