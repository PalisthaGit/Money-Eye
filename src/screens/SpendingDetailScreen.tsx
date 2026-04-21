import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { getUserProfile, getMonthData, saveMonthData } from '../utils/storage';
import { UserProfile, MonthData, Entry } from '../types';
import { HomeStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SpendingDetail'>;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CATEGORIES = ['Food', 'Transport', 'Health', 'Shopping', 'Entertainment', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Transport: '#8B5CF6',
  Health: '#EF4444',
  Shopping: '#EC4899',
  Entertainment: '#F59E0B',
  Other: COLORS.gray,
};

export default function SpendingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const barAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        const p = await getUserProfile();
        const m = await getMonthData(currentMonthKey());
        if (!active) return;
        setProfile(p);
        setMonthData(m);
      }
      load();
      return () => { active = false; };
    }, [])
  );

  useEffect(() => {
    if (!profile || !monthData) return;
    const pct = profile.spendBudget > 0
      ? Math.min((monthData.spending / profile.spendBudget) * 100, 100)
      : 0;
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [profile, monthData]);

  async function handleAddSpend() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0 || !category || !profile) return;

    const key = currentMonthKey();
    const existing = await getMonthData(key);
    const now = new Date();
    const newEntry: Entry = {
      id: generateId(),
      note,
      amount: num,
      category,
      date: now.toISOString(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    const base: MonthData = existing ?? {
      spending: 0, spendEntries: [],
      investment: 0, investTotal: 0, investEntries: [],
      emergency: 0, emergencyEntries: [],
    };

    const newEntries = [...base.spendEntries, newEntry];
    const newSpending = newEntries.reduce((s, e) => s + e.amount, 0);
    const updated: MonthData = { ...base, spendEntries: newEntries, spending: newSpending };
    await saveMonthData(key, updated);
    setMonthData(updated);
    setAmount('');
    setNote('');
    setCategory('');
  }

  if (!profile) {
    return <View style={styles.center} />;
  }

  const spending = monthData?.spending ?? 0;
  const spendEntries = [...(monthData?.spendEntries ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const left = profile.spendBudget - spending;
  const spendPct = profile.spendBudget > 0 ? Math.min((spending / profile.spendBudget) * 100, 100) : 0;
  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const canAdd = parseFloat(amount.replace(/,/g, '')) > 0 && category.length > 0;

  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={16}
    >
      {/* Back */}
      <TouchableOpacity
        style={[styles.backBtn, { marginTop: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Hero banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroAmount}>{fmt(spending, profile.currency)}</Text>
        <Text style={styles.heroLabel}>spent this month</Text>
        <Text style={styles.heroSub}>
          {left >= 0
            ? `${fmt(left, profile.currency)} left`
            : `${fmt(Math.abs(left), profile.currency)} over budget`}
        </Text>
        <View style={styles.heroBarTrack}>
          <Animated.View style={[styles.heroBarFill, { width: barWidth }]} />
        </View>
      </View>

      {/* Log a spend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log a spend</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, category === cat && { backgroundColor: COLORS.red, borderColor: COLORS.red }]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryPillText, category === cat && { color: COLORS.white }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Note (optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity
            style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
            onPress={handleAddSpend}
            activeOpacity={0.85}
            disabled={!canAdd}
          >
            <Text style={styles.addBtnText}>Add spend</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* This month */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This month</Text>
        {spendEntries.length === 0 ? (
          <Text style={styles.emptyText}>No spending logged yet.</Text>
        ) : (
          <View style={styles.card}>
            {spendEntries.map((entry, i) => (
              <View key={entry.id} style={[styles.entryRow, i < spendEntries.length - 1 && styles.entryBorder]}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[entry.category] ?? COLORS.gray }]} />
                <View style={styles.entryInfo}>
                  <Text style={styles.entryNote}>{entry.note || entry.category}</Text>
                  <Text style={styles.entryDate}>{fmtDate(entry.date)}</Text>
                </View>
                <Text style={[styles.entryAmount, { color: COLORS.red }]}>
                  -{fmt(entry.amount, profile.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('SpendingLog')}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>View all logs →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    fontSize: FONT.sizes.md,
    color: COLORS.red,
    fontWeight: FONT.weights.medium,
  },
  heroBanner: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 20,
  },
  heroAmount: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: FONT.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: FONT.sizes.md2,
    color: COLORS.white,
    fontWeight: FONT.weights.medium,
    marginBottom: 16,
  },
  heroBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  heroBarFill: {
    height: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    borderRadius: RADIUS.tag,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryPillText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT.weights.medium,
  },
  addBtn: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
  emptyText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  entryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  entryInfo: {
    flex: 1,
  },
  entryNote: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
  },
  entryDate: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
  },
  viewAllBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONT.sizes.md,
    color: COLORS.red,
    fontWeight: FONT.weights.medium,
  },
});
