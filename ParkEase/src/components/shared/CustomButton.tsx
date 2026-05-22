import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { MotiView } from 'moti';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: CustomButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    switch (type) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    switch (type) {
      case 'outline': return COLORS.primary;
      case 'ghost': return COLORS.text;
      default: return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: loading ? 0.98 : 1 }}
        transition={{ type: 'spring' }}
        style={[
          styles.container,
          { backgroundColor: getBackgroundColor() },
          type === 'outline' && { borderWidth: 1, borderColor: COLORS.primary },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <React.Fragment>
            {icon && <MotiView style={styles.iconContainer}>{icon}</MotiView>}
            <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
          </React.Fragment>
        )}
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  text: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
});
