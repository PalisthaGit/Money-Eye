import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { getUserProfile, getMonthData, saveMonthData } from '../utils/storage';
import { UserProfile, MonthData, Entry } from '../types';
import { HomeStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'EmergencyDetail'>;

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmergencyDetailScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [amount, setAmount] = useState('');
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
    const pct = profile.emergencyTarget > 0
      ? Math.min((monthData.emergency / profile.emergencyTarget) * 100, 100)
      : 0;
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [profile, monthData]);

  async function handleSetAside() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0 || !profile) return;

    const key = currentMonthKey();
    const existing = await getMonthData(key);
    const now = new Date();
    const newEntry: Entry = {
      id: generateId(),
      note,
      amount: num,
      category: 'emergency',
      date: now.toISOString(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    const base: MonthData = existing ?? {
      spending: 0, spendEntries: [],
      investment: 0, investTotal: 0, investEntries: [],
      emergency: 0, emergencyEntries: [],
    };

    const newEntries = [...base.emergencyEntries, newEntry];
    const newEmergency = newEntries.reduce((s, e) => s + e.amount, 0);
    const updated: MonthData = { ...base, emergencyEntries: newEntries, emergency: newEmergency };
    await saveMonthData(key, updated);
    setMonthData(updated);
    setAmount('');
    setNote('');
  }

  if (!profile) {
    return <View style={styles.flex} />;
  }

  const emergency = monthData?.emergency ?? 0;
  const emergencyEntries = [...(monthData?.emergencyEntries ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const emergencyPct = profile.emergencyTarget > 0
    ? Math.min((emergency / profile.emergencyTarget) * 100, 100)
    : 0;
  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const canAdd = parseFloat(amount.replace(/,/g, '')) > 0;

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

      {/* Hero */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroAmount}>{fmt(emergency, profile.currency)}</Text>
        <Text style={styles.heroLabel}>set aside total</Text>
        <Text style={styles.heroSub}>of {fmt(profile.emergencyTarget, profile.currency)} target</Text>
        <View style={styles.heroBarTrack}>
          <Animated.View style={[styles.heroBarFill, { width: barWidth }]} />
        </View>
      </View>

      {/* Notice */}
      <View style={styles.section}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 Lock this in a separate bank account or locker. This is not for daily use — only a genuine emergency.
          </Text>
        </View>
      </View>

      {/* Set aside */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set aside an amount</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Where will you keep it?"
            placeholderTextColor={COLORS.textSecondary}
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity
            style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
            onPress={handleSetAside}
            activeOpacity={0.85}
            disabled={!canAdd}
          >
            <Text style={styles.addBtnText}>Set aside & lock</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Past entries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past contributions</Text>
        {emergencyEntries.length === 0 ? (
          <Text style={styles.emptyText}>No contributions yet.</Text>
        ) : (
          <View style={styles.card}>
            {emergencyEntries.map((entry, i) => (
              <View key={entry.id} style={[styles.entryRow, i < emergencyEntries.length - 1 && styles.entryBorder]}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryNote}>{entry.note || 'Emergency fund'}</Text>
                  <Text style={styles.entryDate}>{fmtDate(entry.date)}</Text>
                </View>
                <Text style={[styles.entryAmount, { color: COLORS.blue }]}>
                  {fmt(entry.amount, profile.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    fontSize: FONT.sizes.md,
    color: COLORS.blue,
    fontWeight: FONT.weights.medium,
  },
  heroBanner: {
    backgroundColor: COLORS.blue,
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
  noticeBox: {
    backgroundColor: COLORS.blueLight,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  noticeText: {
    fontSize: FONT.sizes.md,
    color: COLORS.blueDark,
    lineHeight: 22,
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
  addBtn: {
    backgroundColor: COLORS.blue,
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
  },
  entryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
});
