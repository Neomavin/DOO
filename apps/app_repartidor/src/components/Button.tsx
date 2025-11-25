import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.accent : COLORS.white} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'outline' && styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.accent,
  },
});
