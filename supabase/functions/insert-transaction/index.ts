import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify user JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { account_id, category_id, amount, type, description, transaction_date, reference, status } = body;

    const errors: string[] = [];
    if (!account_id) errors.push('account_id is required');
    if (!category_id) errors.push('category_id is required');
    if (amount === undefined || amount === null) errors.push('amount is required');
    if (!type) errors.push('type is required');
    if (!description) errors.push('description is required');
    if (!transaction_date) errors.push('transaction_date is required');
    if (!['income', 'expense', 'transfer'].includes(type)) errors.push('type must be income, expense, or transfer');

    if (errors.length > 0) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      account_id,
      category_id,
      amount: finalAmount,
      type,
      description: description.trim(),
      reference: reference || null,
      status: status || 'completed',
      transaction_date,
    }).select('*, category:categories(*), account:accounts(bank:banks(*))').single();

    if (error) {
      return new Response(JSON.stringify({ error: 'Insert failed', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, transaction: data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
