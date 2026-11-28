import { Pressable, Text, ViewStyle } from 'react-native';
import { makeStyles } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'secondary', disabled, style }: Props) {
  const styles = useStyles();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, primary && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  base: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceRaised },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.35 },
  label: { color: colors.text, fontSize: 16, fontWeight: '700' },
  primaryLabel: { color: colors.accentText },
}));
