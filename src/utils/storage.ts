import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MonthData } from '../types';

const KEYS = {
  USER_PROFILE: 'moneye_user_profile',
  MONTH_DATA: (month: string) => `moneye_month_${month}`,
} as const;

// UserProfile
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
}

// MonthData
export async function saveMonthData(data: MonthData): Promise<void> {
  await AsyncStorage.setItem(KEYS.MONTH_DATA(data.month), JSON.stringify(data));
}

export async function loadMonthData(month: string): Promise<MonthData | null> {
  const raw = await AsyncStorage.getItem(KEYS.MONTH_DATA(month));
  return raw ? (JSON.parse(raw) as MonthData) : null;
}

export async function clearMonthData(month: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.MONTH_DATA(month));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.clear();
}
