import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ứng dụng vẫn có thể biên dịch, nhưng các cuộc gọi xác thực sẽ thất bại cho đến khi biến môi trường được thiết lập.
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
