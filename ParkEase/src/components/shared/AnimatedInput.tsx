import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextInputProps 
} from 'react-native';
import { MotiView, MotiText } from 'moti';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../theme';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const AnimatedInput = ({
  label,
  error,
  containerStyle,
  icon,
  onFocus,
  onBlur,
  ...props
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <MotiView
        animate={{
          borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
          backgroundColor: isFocused ? 'rgba(45, 90, 254, 0.05)' : COLORS.surface,
        }}
        transition={{ type: 'timing', duration: 200 }}
        style={styles.inputContainer}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textInputWrapper}>
          <MotiText
            animate={{
              translateY: isFocused || props.value ? -10 : 0,
              fontSize: isFocused || props.value ? 12 : 16,
              color: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.textSecondary,
            }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.label}
          >
            {label}
          </MotiText>
          <TextInput
            {...props}
            style={[styles.input, { paddingTop: isFocused || props.value ? 10 : 0 }]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </MotiView>
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -5 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.errorContainer}
        >
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textInputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    ...TYPOGRAPHY.body,
  },
  input: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    height: '100%',
  },
  errorContainer: {
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
  },
});
