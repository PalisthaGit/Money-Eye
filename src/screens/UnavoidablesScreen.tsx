import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { Unavoidable } from '../types';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Unavoidables'>;
type Route = RouteProp<OnboardingStackParamList, 'Unavoidables'>;

const DEFAULT_ITEMS: Unavoidable[] = [
  { id: 'rent', name: 'Rent', amount: 0 },
  { id: 'groceries', name: 'Groceries', amount: 0 },
  { id: 'transport', name: 'Transport', amount: 0 },
  { id: 'meds', name: 'Meds', amount: 0 },
];

export default function UnavoidablesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { salary, currency } = route.params;
  const [items, setItems] = useState<Unavoidable[]>(DEFAULT_ITEMS);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  function handleAmountChange(id: string, value: string) {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const num = parseFloat(value.replace(/,/g, ''));
        return { ...item, amount: isNaN(num) ? 0 : num };
      })
    );
  }

  function handleAdd() {
    let valid = true;
    if (!name.trim()) {
      setNameError('Enter a name');
      valid = false;
    }
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError('Enter a valid amount');
      valid = false;
    }
    if (!valid) return;
    setItems(prev => [...prev, { id: Date.now().toString(), name: name.trim(), amount: num }]);
    setName('');
    setAmount('');
    setNameError('');
    setAmountError('');
  }

  function handleRemove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleContinue() {
    navigation.navigate('Breakdown', {
      salary,
      currency,
      unavoidables: items,
    });
  }

  const hasValidItem = items.some(i => i.amount > 0);
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.step}>Step 2 of 4</Text>
        <Text style={styles.title}>Fixed Monthly Costs</Text>
        <Text style={styles.subtitle}>
          Bills you pay every month, no matter what. Set the amount for each — enter 0 or delete items
          that don't apply.
        </Text>

        <View style={styles.listCard}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index < items.length - 1 && styles.itemBorder]}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemRight}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={item.amount === 0 ? '' : String(item.amount)}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  onChangeText={v => handleAmountChange(item.id, v)}
                />
                <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {items.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{total.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.addCard}>
          <Text style={styles.addLabel}>Add a custom item</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="Name (e.g. Internet)"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={v => { setName(v); setNameError(''); }}
          />
          {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
          <TextInput
            style={[styles.input, amountError ? styles.inputError : null]}
            placeholder="Amount (e.g. 50)"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={v => { setAmount(v); setAmountError(''); }}
          />
          {amountError ? <Text style={styles.error}>{amountError}</Text> : null}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !hasValidItem && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!hasValidItem}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
    lineHeight: 22,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountInput: {
    width: 80,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    textAlign: 'right',
    backgroundColor: COLORS.background,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: FONT.sizes.xs, color: COLORS.danger, fontWeight: FONT.weights.medium },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.primarySurface,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryLight,
  },
  totalLabel: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.primary,
  },
  totalAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.primary,
  },
  addCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  addLabel: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: 4,
    backgroundColor: COLORS.background,
  },
  inputError: { borderColor: COLORS.danger },
  error: {
    fontSize: FONT.sizes.xs,
    color: COLORS.danger,
    marginBottom: 8,
    marginLeft: 2,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.button,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  addButtonText: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.medium,
    color: COLORS.white,
  },
});
