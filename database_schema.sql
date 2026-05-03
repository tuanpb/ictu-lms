-- ============================================================
-- 1. TẠO CÁC BẢNG DỮ LIỆU (TABLES)
-- ============================================================

-- Bảng profiles: Lưu thông tin người dùng, liên kết với auth.users của Supabase
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    coin BIGINT DEFAULT 0,
    full_name TEXT,
    last_session_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bảng subjects: Lưu trữ thông tin môn học
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    data_url TEXT,
    unlock_coin BIGINT DEFAULT 0,
    rental_coin BIGINT DEFAULT 0,
    active SMALLINT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    update_date TIMESTAMP WITH TIME ZONE
);

-- Bảng user_subjects: Lưu thông tin môn học đã được mở khóa hoặc thuê bởi người dùng
CREATE TABLE public.user_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_subject UNIQUE (user_id, subject_id)
);

-- Bảng coin_transactions: Lưu lịch sử nạp xu hoặc tiêu xu của người dùng
CREATE TABLE public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    amount BIGINT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    bank_ref TEXT UNIQUE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bảng webhook_logs: Lưu log webhook (ví dụ webhook từ SePay để nạp xu)
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 2. BẬT ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
-- Bảng webhook_logs không cần bật RLS vì chỉ phía server ghi log.

-- ============================================================
-- 3. CÁC POLICY CHO RLS
-- ============================================================

-- Policies cho bảng profiles
CREATE POLICY "Profiles are viewable by users who created them" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies cho bảng subjects
CREATE POLICY "Allow public read access" 
ON public.subjects FOR SELECT USING (true);

-- Policies cho bảng user_subjects
CREATE POLICY "Users can view their own unlocked subjects" 
ON public.user_subjects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked subjects" 
ON public.user_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies cho bảng coin_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.coin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG KÝ (TRIGGERS & FUNCTIONS)
-- ============================================================

-- Hàm tự động insert data vào bảng profiles khi một user mới được tạo ở auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger gọi hàm handle_new_user() mỗi khi có user mới
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
