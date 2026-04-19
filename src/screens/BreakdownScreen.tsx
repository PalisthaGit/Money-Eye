import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { calcFreeMoney } from '../utils/calculations';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Breakdown'>;
type Route = RouteProp<OnboardingStackParamList, 'Breakdown'>;

export default function BreakdownScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { salary, currency, unavoidables } = params;

  const totalFixed = unavoidables.reduce((sum, u) => sum + u.amount, 0);
  const freeMoney = calcFreeMoney(salary, unavoidables);

  const fmt = (n: number) => `${currency} ${n.toFixed(2)}`;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step 3 of 4</Text>
      <Text style={styles.title}>Your Money Breakdown</Text>
      <Text style={styles.subtitle}>Here's how your salary actually breaks down.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Monthly Salary</Text>
        <Text style={[styles.cardAmount, { color: COLORS.income }]}>{fmt(salary)}</Text>
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={[styles.cardLabel, { color: COLORS.dangerDeep }]}>Fixed Costs</Text>
        <Text style={[styles.cardAmount, { color: COLORS.danger }]}>{fmt(totalFixed)}</Text>
        <Text style={[styles.cardNote, { color: COLORS.danger }]}>
          Rent, groceries, transport, and other unavoidables
        </Text>
      </View>

      <View style={[styles.card, styles.primaryCard]}>
        <Text style={[styles.cardLabel, { color: COLORS.primary }]}>Free Money</Text>
        <Text style={[styles.cardAmount, { color: COLORS.primary }]}>{fmt(freeMoney)}</Text>
        <Text style={[styles.cardNote, { color: COLORS.primaryMid }]}>
          This is what you actually have to work with
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Plan', { salary, currency, unavoidables })}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>See how to use it</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  step: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.primaryAccent,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  dangerCard: {
    borderColor: '#FECACA',
    backgroundColor: COLORS.dangerBg,
  },
  primaryCard: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primarySurface,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.medium,
    marginBottom: 4,
  },
  cardNote: {
    fontSize: FONT.sizes.sm,
    lineHeight: 20,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.medium,
    color: COLORS.white,
  },
});
