import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Define types for the request body
interface VoidPayload {
    transactionId: string;
}

// Define types for the transaction data structure (simplified)
interface TransactionItemData {
    sourceId: string;
    quantity: number;
    type: 'inventory' | 'membership';
    isGiveaway?: boolean;
}

interface TransactionRecord {
    id: string;
    type: 'Membership' | 'POS Sale' | 'Mixed Sale';
    items_data: TransactionItemData[] | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client using the Service Role Key for elevated permissions
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 1. Authentication Check (Ensure user is staff/owner)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: corsHeaders });
  }
  
  const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: corsHeaders });
  }
  
  // Fetch user profile to check role (Staff/Owner required to void transactions)
  const { data: staffProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
  const userRole = staffProfile?.role;
  if (!userRole || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'cashier')) {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not authorized staff to void transactions' }), { status: 403, headers: corsHeaders });
  }

  // 2. Parse Payload
  let payload: VoidPayload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: corsHeaders });
  }
  
  const { transactionId } = payload;
  
  try {
    // 3. Fetch the transaction details using Admin client
    const { data: tx, error: fetchError } = await supabaseAdmin
        .from('transactions')
        .select('id, type, items_data')
        .eq('id', transactionId)
        .single();

    if (fetchError || !tx) {
        throw new Error("Transaction not found or failed to fetch.");
    }
    
    let requiresManualMembershipReversal = false;
    
    // 4. Attempt Inventory Reversal (using Admin client to call RPC)
    if (tx.items_data && (tx.type === 'POS Sale' || tx.type === 'Mixed Sale')) {
        const inventoryItemsToReverse = tx.items_data.filter(item => item.type === 'inventory' && item.quantity > 0);
        
        if (inventoryItemsToReverse.length > 0) {
            await Promise.all(inventoryItemsToReverse.map(async item => {
                const { error: rpcError } = await supabaseAdmin.rpc('increment_inventory_stock', {
                    item_id: item.sourceId,
                    quantity_to_increment: item.quantity,
                });
                
                if (rpcError) {
                    console.error("Inventory Reversal RPC error:", rpcError);
                    // NOTE: We throw here to stop the entire void process if inventory reversal fails
                    throw new Error(`Failed to reverse stock for item ID ${item.sourceId}.`);
                }
            }));
        }
    }
    
    // 5. Membership Reversal Check
    if (tx.type === 'Membership' || tx.type === 'Mixed Sale') {
        requiresManualMembershipReversal = true;
        // NOTE: We do NOT attempt automatic membership reversal here, as it requires complex logic 
        // (e.g., finding the previous expiration date) which should be done manually by staff.
    }

    // 6. Delete the transaction using Admin client
    const { error: deleteError } = await supabaseAdmin
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (deleteError) {
        console.error("Transaction delete error:", deleteError);
        throw new Error("Failed to delete transaction record.");
    }

    // 7. Success Response
    return new Response(JSON.stringify({ 
        success: true,
        requiresManualMembershipReversal: requiresManualMembershipReversal,
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("Void Transaction Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});