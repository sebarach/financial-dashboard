-- ============================================
-- Financial Dashboard — Auth Migration
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Agregar user_id a las tablas
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transfer_pairs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Habilitar RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_pairs ENABLE ROW LEVEL SECURITY;

-- 3. Policies — accounts
CREATE POLICY "Users see own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- 4. Policies — transactions
CREATE POLICY "Users see own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 5. Policies — budgets
CREATE POLICY "Users see own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies — transfer_pairs
CREATE POLICY "Users see own transfers" ON transfer_pairs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transfers" ON transfer_pairs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own transfers" ON transfer_pairs FOR DELETE USING (auth.uid() = user_id);
