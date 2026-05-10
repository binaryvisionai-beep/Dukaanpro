import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};
const supabaseUrl = extra.supabaseUrl ?? '';
const supabaseAnon = extra.supabaseAnonKey ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnon);