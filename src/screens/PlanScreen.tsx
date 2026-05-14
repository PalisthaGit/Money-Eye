import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { saveUserProfile } from '../utils/storage';
import { calcBudgets, calcUnused } from '../utils/calculations';
import { useOnboardingComplete } from '../navigation';
import { OnboardingStackParamList } from '../navigation';

type Route = RouteProp<OnboardingStackParamList, 'Plan'>;

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function AnimatedBar({ pct, color, trackColor }: { pct: number; color: string; trackColor: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(pct, 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export default function PlanScreen() {
  const onComplete = useOnboardingComplete();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const { name, salary, currency, bills } = route.params;
  const [saving, setSaving] = useState(false);

  const INVEST_PCT = 20;
  const SAVINGS_PCT = 10;
  const EMERGENCY_PCT = 10;

  const { spendBudget, investBudget, savingsBudget, emergencyBudget } = calcBudgets(
    salary, INVEST_PCT, SAVINGS_PCT, EMERGENCY_PCT,
  );
  const unused = calcUnused(salary, spendBudget + investBudget + savingsBudget + emergencyBudget);

  const spendPct = salary > 0 ? Math.min((spendBudget / salary) * 100, 100) : 0;
  const investPct = salary > 0 ? Math.min((investBudget / salary) * 100, 100) : 0;
  const savingsPct = salary > 0 ? Math.min((savingsBudget / salary) * 100, 100) : 0;
  const emergencyPct = salary > 0 ? Math.min((emergencyBudget / salary) * 100, 100) : 0;

  async function handleStart() {
    setSaving(true);
    await saveUserProfile({
      name,
      salary,
      bills,
      spendBudget,
      investBudget,
      emergencyTarget: emergencyBudget * 6,
      currency,
      onboardingComplete: true,
      investPct: INVEST_PCT,
      savingsPct: SAVINGS_PCT,
      emergencyPct: EMERGENCY_PCT,
    });
    onComplete();
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.step}>4 of 4</Text>
      <Text style={styles.title}>{name}, here's your plan</Text>
      <Text style={styles.subtitle}>Based on your salary and fixed bills.</Text>

      {/* Spending budget card */}
      <View style={[styles.card, { backgroundColor: COLORS.redLight, borderColor: COLORS.red }]}>
        <Text style={[styles.cardLabel, { color: COLORS.redDark }]}>SPENDING</Text>
        <Text style={[styles.cardAmount, { color: COLORS.red }]}>{fmt(spendBudget, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.redDark }]}>guilt-free spending</Text>
        <AnimatedBar pct={spendPct} color={COLORS.red} trackColor='#F9C8C8' />
      </View>

      {/* Investing card */}
      <View style={[styles.card, { backgroundColor: COLORS.purpleLight, borderColor: COLORS.purple }]}>
        <Text style={[styles.cardLabel, { color: COLORS.purpleDark }]}>INVESTING</Text>
        <Text style={[styles.cardAmount, { color: COLORS.purple }]}>{fmt(investBudget, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.purpleDark }]}>pay yourself first</Text>
        <AnimatedBar pct={investPct} color={COLORS.purple} trackColor='#D6D3F8' />
      </View>

      {/* Savings card */}
      <View style={[styles.card, { backgroundColor: COLORS.greenLight, borderColor: COLORS.green }]}>
        <Text style={[styles.cardLabel, { color: COLORS.greenDark }]}>SAVINGS</Text>
        <Text style={[styles.cardAmount, { color: COLORS.green }]}>{fmt(savingsBudget, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.greenDark }]}>build your savings</Text>
        <AnimatedBar pct={savingsPct} color={COLORS.green} trackColor='#A8E6D1' />
      </View>

      {/* Emergency fund card */}
      <View style={[styles.card, { backgroundColor: COLORS.blueLight, borderColor: COLORS.blue }]}>
        <Text style={[styles.cardLabel, { color: COLORS.blueDark }]}>EMERGENCY</Text>
        <Text style={[styles.cardAmount, { color: COLORS.blue }]}>{fmt(emergencyBudget, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.blueDark }]}>safety net contributions</Text>
        <AnimatedBar pct={emergencyPct} color={COLORS.blue} trackColor='#C2DCF5' />
      </View>

      {/* Unused card */}
      <View style={[styles.card, { backgroundColor: COLORS.grayLight, borderColor: COLORS.gray }]}>
        <Text style={[styles.cardLabel, { color: COLORS.gray }]}>UNUSED</Text>
        <Text style={[styles.cardAmount, { color: COLORS.textPrimary }]}>{fmt(unused, currency)}</Text>
        <Text style={styles.cardSub}>available</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleStart}
        activeOpacity={0.85}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Start tracking →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: {
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  step: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  barTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: RADIUS.full,
  },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
});
