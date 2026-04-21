import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MonthData } from '../types';

const USER_KEY = 'moneye_profile_v2';
const MONTH_PREFIX = 'moneye_month_v2_';
const MONTH_KEYS_KEY = 'moneye_month_keys_v2';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveMonthData(monthKey: string, data: MonthData): Promise<void> {
  await AsyncStorage.setItem(MONTH_PREFIX + monthKey, JSON.stringify(data));
  const keys = await getAllMonthKeys();
  if (!keys.includes(monthKey)) {
    await AsyncStorage.setItem(MONTH_KEYS_KEY, JSON.stringify([...keys, monthKey]));
  }
}

export async function getMonthData(monthKey: string): Promise<MonthData | null> {
  const raw = await AsyncStorage.getItem(MONTH_PREFIX + monthKey);
  return raw ? JSON.parse(raw) : null;
}

export async function getAllMonthKeys(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(MONTH_KEYS_KEY);
  return raw ? JSON.parse(raw) : [];
}
