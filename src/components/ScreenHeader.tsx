import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme';

/** Header for screens opened from the menu: a back link and a centered title. */
export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" style={styles.side}>
        <Text style={styles.back}>‹ Menu</Text>
      </Pressable>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  side: { minWidth: 70 },
  back: { color: colors.muted, fontSize: 17, fontWeight: '600' },
  title: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
}));
