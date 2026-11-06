import { StyleSheet, Text, View } from 'react-native';

export function GoogleMark() {
  return (
    <View style={styles.badge} accessibilityElementsHidden>
      <Text style={styles.letter}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#1A73E8',
    fontWeight: '700',
    fontSize: 15,
  },
});
