-- ============================================
-- Financial Dashboard — Database Schema
-- Project: financial-sebarach
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. BANKS
-- ============================================
create table banks (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  color text not null,
  color_alt text not null,
  logo_url text,
  created_at timestamptz default now() not null
);

-- ============================================
-- 2. CATEGORIES
-- ============================================
create table categories (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  icon text not null default '📌',
  color text not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  created_at timestamptz default now() not null
);

-- ============================================
-- 3. ACCOUNTS
-- ============================================
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  bank_id uuid not null references banks(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('checking', 'savings', 'credit', 'investment')),
  balance bigint not null default 0,
  currency text not null default 'CLP' check (currency in ('CLP', 'USD')),
  last_sync timestamptz default now() not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- 4. TRANSACTIONS
-- ============================================
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  amount bigint not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  description text not null,
  reference text,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed')),
  transaction_date timestamptz not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- 5. BUDGETS
-- ============================================
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid not null references categories(id) on delete cascade,
  amount bigint not null,
  period_month int not null check (period_month between 1 and 12),
  period_year int not null,
  created_at timestamptz default now() not null,
  unique(category_id, period_month, period_year)
);

-- ============================================
-- 6. TRANSFER_PAIRS (for tracking transfers between accounts)
-- ============================================
create table transfer_pairs (
  id uuid default uuid_generate_v4() primary key,
  from_transaction_id uuid not null references transactions(id) on delete cascade,
  to_transaction_id uuid not null references transactions(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_transactions_account on transactions(account_id);
create index idx_transactions_category on transactions(category_id);
create index idx_transactions_date on transactions(transaction_date desc);
create index idx_transactions_type on transactions(type);
create index idx_transactions_status on transactions(status);
create index idx_accounts_bank on accounts(bank_id);
create index idx_budgets_period on budgets(period_year, period_month);

-- ============================================
-- VIEWS — para el dashboard
-- ============================================

-- Monthly summary
create view vw_monthly_summary as
select
  date_trunc('month', transaction_date) as month,
  sum(case when type = 'income' then amount else 0 end) as total_income,
  sum(case when type = 'expense' then abs(amount) else 0 end) as total_expenses,
  sum(amount) as net_amount,
  count(*) as transaction_count
from transactions
where status = 'completed'
group by date_trunc('month', transaction_date);

-- Category breakdown (current month)
create view vw_category_breakdown as
select
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  c.icon,
  c.color,
  sum(abs(t.amount)) as total_amount,
  round(
    sum(abs(t.amount))::numeric /
    nullif(sum(sum(abs(t.amount))) over (), 0) * 100
  , 1) as percentage
from transactions t
join categories c on c.id = t.category_id
where t.type = 'expense'
  and t.status = 'completed'
  and date_trunc('month', t.transaction_date) = date_trunc('month', now())
group by c.id, c.name, c.slug, c.icon, c.color
order by total_amount desc;

-- ============================================
-- RLS (Row Level Security) — public read por ahora
-- ============================================
alter table banks enable row level security;
alter table categories enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table transfer_pairs enable row level security;

create policy "Public read banks" on banks for select to anon, authenticated using (true);
create policy "Public read categories" on categories for select to anon, authenticated using (true);
create policy "Public read accounts" on accounts for select to anon, authenticated using (true);
create policy "Public read transactions" on transactions for select to anon, authenticated using (true);
create policy "Public read budgets" on budgets for select to anon, authenticated using (true);
