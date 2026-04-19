import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { saveUserProfile } from '../utils/storage';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Salary'>;

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'NPR', name: 'Nepalese Rupee' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'CHF', name: 'Swiss Franc' },
];

export default function SalaryScreen() {
  const navigation = useNavigation<Nav>();
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = CURRENCIES.find(c => c.code === currency)!;

  const filtered = CURRENCIES.filter(c => {
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  async function handleContinue() {
    const num = parseFloat(salary.replace(/,/g, ''));
    if (!salary || isNaN(num) || num <= 0) {
      setError('Please enter a valid salary amount.');
      return;
    }
    await saveUserProfile({
      salary: num,
      currency,
      unavoidables: [],
      emergencyFundTarget: 0,
      investmentSlice: 0,
      onboardingComplete: false,
    });
    navigation.navigate('Unavoidables', { salary: num, currency });
  }

  function handleSelect(code: string) {
    setCurrency(code);
    setModalVisible(false);
    setSearch('');
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={16}
      >
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>What's your monthly take-home?</Text>
        <Text style={styles.subtitle}>After taxes and deductions</Text>

        <Text style={styles.label}>Currency</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectorText}>
            {selectedCurrency.code} — {selectedCurrency.name}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Monthly Salary</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>{currency}</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={salary}
            onChangeText={v => {
              setSalary(v);
              setError('');
            }}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearch(''); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search currency..."
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />

            <FlatList
              data={filtered}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.currencyRow, item.code === currency && styles.currencyRowActive]}
                  onPress={() => handleSelect(item.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.currencyRowText, item.code === currency && styles.currencyRowTextActive]}>
                    {item.code} — {item.name}
                  </Text>
                  {item.code === currency && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
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
    marginBottom: 40,
  },
  label: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 32,
  },
  selectorText: {
    flex: 1,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
  },
  dropdownArrow: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
    paddingVertical: 16,
  },
  error: {
    fontSize: FONT.sizes.sm,
    color: COLORS.danger,
    marginBottom: 16,
  },
  button: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.medium,
    color: COLORS.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: FONT.sizes.lg,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    paddingLeft: 16,
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 8,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  currencyRowActive: {
    backgroundColor: COLORS.primarySurface,
  },
  currencyRowText: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  currencyRowTextActive: {
    color: COLORS.primary,
    fontWeight: FONT.weights.medium,
  },
  checkmark: {
    fontSize: FONT.sizes.md,
    color: COLORS.primary,
    fontWeight: FONT.weights.medium,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
});
