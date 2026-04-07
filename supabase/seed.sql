-- ============================================
-- Seed Data — Financial Dashboard
-- ============================================

-- Banks
insert into banks (id, slug, name, color, color_alt) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'banco-chile', 'Banco de Chile', '#0033A0', '#E4002B'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bci', 'BCI', '#00A650', '#003D7C'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'santander', 'Santander', '#EC0000', '#FFFFFF'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'mercado-pago', 'Mercado Pago', '#009EE3', '#FFD100');

-- Categories
insert into categories (id, slug, name, icon, color, type) values
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'salary', 'Sueldo', '💼', '#06B6D4', 'income'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'freelance', 'Freelance', '💻', '#8B5CF6', 'income'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'food', 'Comida', '🍔', '#FF6B6B', 'expense'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'transport', 'Transporte', '🚇', '#F59E0B', 'expense'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'entertainment', 'Entretenimiento', '🎬', '#A78BFA', 'expense'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'bills', 'Cuentas', '💡', '#4ECDC4', 'expense'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'investment', 'Inversión', '📈', '#06B6D4', 'expense'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'transfer', 'Transferencia', '⇄', '#FBBF24', 'transfer'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b09', 'other', 'Otro', '📌', '#9CA3AF', 'expense');

-- Accounts
insert into accounts (id, bank_id, name, account_type, balance, currency) values
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cuenta Corriente', 'checking', 1845000, 'CLP'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Caja de Ahorro', 'savings', 3200000, 'CLP'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Cuenta Corriente', 'checking', 920000, 'CLP'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Mercado Pago', 'savings', 450000, 'CLP');

-- Transactions (abril 2026)
insert into transactions (account_id, category_id, amount, type, description, status, transaction_date) values
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 2500000, 'income', 'Sueldo Marzo 2026', 'completed', '2026-04-07T09:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 800000, 'income', 'Pago freelance - Dashboard React', 'completed', '2026-04-07T10:30:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', -85000, 'expense', 'Supermercado Líder', 'completed', '2026-04-06T14:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', -20000, 'expense', 'Metro Bip! recarga', 'completed', '2026-04-06T08:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', -11990, 'expense', 'Netflix', 'completed', '2026-04-05T22:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', -45000, 'expense', 'Cuenta luz abril', 'pending', '2026-04-05T10:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', -500000, 'transfer', 'Transferencia a ahorro', 'completed', '2026-04-04T16:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', -200000, 'expense', 'ETF IWV compra', 'completed', '2026-04-04T09:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 600000, 'income', 'Pago freelance - API REST', 'completed', '2026-04-03T12:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', -32000, 'expense', 'Uber Eats sushi', 'completed', '2026-04-02T19:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', -28000, 'expense', 'Jumbo snacks', 'completed', '2026-04-01T18:00:00Z'),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 450000, 'income', 'Dividendos ETF', 'completed', '2026-04-01T10:00:00Z');

-- Budgets (abril 2026)
insert into budgets (category_id, amount, period_month, period_year) values
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 200000, 4, 2026),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 50000, 4, 2026),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 30000, 4, 2026),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 100000, 4, 2026),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 300000, 4, 2026);
