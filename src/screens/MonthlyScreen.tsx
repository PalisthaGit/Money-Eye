import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT } from '../constants/theme';

export default function MonthlyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Monthly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  text: { fontSize: FONT.sizes.xl, color: COLORS.textPrimary, fontWeight: FONT.weights.medium },
});
