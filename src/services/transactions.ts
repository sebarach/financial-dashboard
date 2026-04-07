// ============================================
// Transaction Service — Capa de negocio
// ============================================

import { supabase } from '@/lib/supabase';

export interface CreateTransactionInput {
  account_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  transaction_date: string;
  status?: 'completed' | 'pending';
}

export interface TransferInput {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  transaction_date: string;
}

export interface ValidationErrors {
  [field: string]: string;
}

export function validateTransaction(input: Partial<CreateTransactionInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.account_id) {
    errors.account_id = 'Selecciona una cuenta';
  }

  if (!input.category_id) {
    errors.category_id = 'Selecciona una categoría';
  }

  if (!input.type) {
    errors.type = 'Selecciona el tipo';
  }

  if (!input.amount && input.amount !== 0) {
    errors.amount = 'Ingresa un monto';
  } else if (input.amount === 0) {
    errors.amount = 'El monto no puede ser $0';
  } else if (input.amount < 0) {
    errors.amount = 'Ingresa un monto positivo (el signo se aplica automáticamente)';
  } else if (input.amount > 999999999) {
    errors.amount = 'El monto excede el límite';
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.description = 'Agrega una descripción';
  } else if (input.description.trim().length < 3) {
    errors.description = 'Mínimo 3 caracteres';
  } else if (input.description.trim().length > 120) {
    errors.description = 'Máximo 120 caracteres';
  }

  if (!input.transaction_date) {
    errors.transaction_date = 'Selecciona una fecha';
  } else {
    const date = new Date(input.transaction_date);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    if (date > now) {
      errors.transaction_date = 'La fecha no puede ser futura';
    } else if (date < oneYearAgo) {
      errors.transaction_date = 'Máximo 1 año atrás';
    }
  }

  return errors;
}

export function validateTransfer(input: Partial<TransferInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.from_account_id) errors.from_account_id = 'Selecciona cuenta origen';
  if (!input.to_account_id) errors.to_account_id = 'Selecciona cuenta destino';

  if (input.from_account_id && input.to_account_id && input.from_account_id === input.to_account_id) {
    errors.to_account_id = 'Las cuentas deben ser diferentes';
  }

  if (!input.amount || input.amount <= 0) {
    errors.amount = 'Ingresa un monto positivo';
  } else if (input.amount > 999999999) {
    errors.amount = 'El monto excede el límite';
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.description = 'Agrega una descripción';
  }

  if (!input.transaction_date) {
    errors.transaction_date = 'Selecciona una fecha';
  }

  return errors;
}

export async function createTransaction(input: CreateTransactionInput) {
  const amount = input.type === 'expense' ? -Math.abs(input.amount) : Math.abs(input.amount);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      account_id: input.account_id,
      category_id: input.category_id,
      amount,
      type: input.type,
      description: input.description.trim(),
      transaction_date: input.transaction_date,
      status: input.status || 'completed',
    })
    .select('*, category:categories(*), account:accounts(bank:banks(*))')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createTransfer(input: TransferInput) {
  const { data: fromTx, error: err1 } = await supabase
    .from('transactions')
    .insert({
      account_id: input.from_account_id,
      category_id: (await getTransferCategoryId()),
      amount: -Math.abs(input.amount),
      type: 'transfer',
      description: `Transferencia → ${input.description}`.trim(),
      transaction_date: input.transaction_date,
      status: 'completed',
    })
    .select('id')
    .single();

  if (err1) throw new Error(err1.message);

  const { data: toTx, error: err2 } = await supabase
    .from('transactions')
    .insert({
      account_id: input.to_account_id,
      category_id: (await getTransferCategoryId()),
      amount: Math.abs(input.amount),
      type: 'transfer',
      description: `Transferencia ← ${input.description}`.trim(),
      transaction_date: input.transaction_date,
      status: 'completed',
    })
    .select('id')
    .single();

  if (err2) throw new Error(err2.message);

  // Link the pair
  await supabase
    .from('transfer_pairs')
    .insert({
      from_transaction_id: fromTx.id,
      to_transaction_id: toTx.id,
    });

  return { from: fromTx, to: toTx };
}

let _transferCategoryId = '';
async function getTransferCategoryId(): Promise<string> {
  if (_transferCategoryId) return _transferCategoryId;
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'transfer')
    .single();
  _transferCategoryId = data?.id ?? '';
  return _transferCategoryId;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
