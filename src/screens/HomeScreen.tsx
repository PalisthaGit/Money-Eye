import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONT, RADIUS } from '../constants/theme';
import { loadUserProfile, loadMonthData } from '../utils/storage';
import {
  calcSpendingMoney,
  calcTotalSpent,
  calcTotalIncome,
  calcRemainingBudget,
} from '../utils/calculations';
import { UserProfile, MonthData, Expense, Income } from '../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function currentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function fmt(value: number, currency: string): string {
  return `${currency}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Transaction =
  | (Expense & { kind: 'expense' })
  | (Income & { kind: 'income' });

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        setLoading(true);
        const p = await loadUserProfile();
        const m = await loadMonthData(currentMonthKey());
        if (active) {
          setProfile(p);
          setMonthData(m);
          setLoading(false);
        }
      }
      load();
      return () => { active = false; };
    }, [])
  );

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const expenses = monthData?.expenses ?? [];
  const incomes = monthData?.incomes ?? [];

  const spendingMoney = calcSpendingMoney(
    profile.salary - profile.unavoidables.reduce((s, u) => s + u.amount, 0),
    profile.investmentSlice
  );
  const totalSpent = calcTotalSpent(expenses);
  const totalIn = calcTotalIncome(profile.salary, incomes);
  const remaining = calcRemainingBudget(spendingMoney, totalSpent);

  const pctSpent = spendingMoney > 0 ? Math.min((totalSpent / spendingMoney) * 100, 100) : 0;
  const barColor =
    pctSpent >= 100
      ? COLORS.danger
      : pctSpent >= 80
      ? COLORS.warning
      : COLORS.primaryAccent;

  const transactions: Transaction[] = [
    ...expenses.map((e) => ({ ...e, kind: 'expense' as const })),
    ...incomes.map((i) => ({ ...i, kind: 'income' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Text style={styles.subGreeting}>Here's your money snapshot</Text>

      {/* Main spending card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Spending money left</Text>
        <Text style={[styles.bigNumber, { color: remaining >= 0 ? COLORS.primary : COLORS.danger }]}>
          {fmt(remaining, profile.currency)}
        </Text>
        <Text style={styles.cardSub}>of {fmt(spendingMoney, profile.currency)} this month</Text>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pctSpent}%` as any, backgroundColor: barColor }]} />
        </View>
      </View>

      {/* Total in / Total out */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Total in</Text>
          <Text style={[styles.smallNumber, { color: COLORS.income }]}>
            {fmt(totalIn, profile.currency)}
          </Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Total out</Text>
          <Text style={[styles.smallNumber, { color: COLORS.danger }]}>
            {fmt(totalSpent, profile.currency)}
          </Text>
        </View>
      </View>

      {/* Investment reminder */}
      <View style={[styles.card, { backgroundColor: COLORS.tealLight }]}>
        <Text style={[styles.cardLabel, { color: COLORS.tealDeep }]}>Invest this month</Text>
        <Text style={[styles.smallNumber, { color: COLORS.teal }]}>
          {fmt(profile.investmentSlice, profile.currency)}
        </Text>
        <Text style={[styles.cardSub, { color: COLORS.teal }]}>Lock it away, let it grow</Text>
      </View>

      {/* Recent transactions */}
      <Text style={styles.sectionHeading}>Recent</Text>
      <View style={styles.card}>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet. Tap + to add one.</Text>
        ) : (
          transactions.map((t, i) => (
            <View
              key={t.id}
              style={[styles.txRow, i === transactions.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.txLabel}>
                {t.kind === 'expense' ? t.category : t.label}
              </Text>
              <Text
                style={[
                  styles.txAmount,
                  { color: t.kind === 'expense' ? COLORS.danger : COLORS.income },
                ]}
              >
                {t.kind === 'expense' ? '-' : '+'}
                {fmt(t.amount, profile.currency)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  bigNumber: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  smallNumber: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: RADIUS.full,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  txAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
