import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface Props {
  value: number;
  selected: boolean;
  isTarget: boolean;
  onPress: () => void;
}

export function NumberTile({ value, selected, isTarget, onPress }: Props) {
  const [scale] = useState(() => new Animated.Value(0.6));

  // Pop in whenever a tile is created (new tiles get new keys).
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Number ${value}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          selected && styles.selected,
          isTarget && styles.target,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[styles.text, selected && styles.selectedText, value >= 1000 && styles.small]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 92,
    height: 92,
    borderRadius: 20,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    paddingHorizontal: 6,
  },
  selected: { backgroundColor: colors.accent, borderColor: '#FFE0A8' },
  target: { backgroundColor: colors.success, borderColor: '#B8FFE0' },
  pressed: { transform: [{ scale: 0.94 }] },
  text: { color: colors.text, fontSize: 32, fontWeight: '800' },
  selectedText: { color: colors.accentText },
  small: { fontSize: 24 },
});
