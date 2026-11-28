import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { makeStyles, useColors } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  /** Shown as text, or, when `icon` is set, read out by screen readers instead. */
  label: string;
  icon?: IconName;
  /** Icon color override (defaults to the button's text color). */
  iconColor?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  selected?: boolean;
}

export function Button({ label, icon, iconColor, onPress, variant = 'secondary', disabled, style, selected }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
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
      {icon ? (
        <Ionicons name={icon} size={24} color={iconColor ?? (primary ? colors.accentText : colors.text)} />
      ) : (
        <Text style={[styles.label, primary && styles.primaryLabel]}>{label}</Text>
      )}
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
