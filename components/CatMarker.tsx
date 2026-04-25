import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  catCount: number;
  fedCount?: number;
};

export function CatMarker({ catCount, fedCount = 0 }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.emoji}>🐱</Text>
        {catCount > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{catCount}</Text>
          </View>
        )}
      </View>
      {fedCount > 0 && (
        <View style={styles.fedBadge}>
          <Text style={styles.fedText}>🍽️{fedCount}</Text>
        </View>
      )}
      <View style={styles.pin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: { fontSize: 22 },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  countText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  fedBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
  },
  fedText: { fontSize: 9, color: '#fff' },
  pin: {
    width: 2,
    height: 6,
    backgroundColor: Colors.primary,
  },
});
