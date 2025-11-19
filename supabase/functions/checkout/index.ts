import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Define types for the request body (must match client payload)
interface CartItemPayload {
    sourceId: string;
    quantity: number;
    type: 'inventory' | 'membership';
    price: number; // Price paid (for discount tracking)
    originalPrice: number; // Original price (for validation)
    isGiveaway?: boolean;
}

interface CheckoutPayload {
    cart: CartItemPayload[];
    memberId: string | null;
    paymentMethod: 'Card' | 'Cash' | 'Transfer';
    discountPercent: number;
    isInitialRegistration: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants
const TAX_RATE = 0.08;
const PRICE_TOLERANCE = 0.01; // Allow 1 cent deviation for floating point safety

// Initialize Supabase client using the Service Role Key for elevated permissions
// This is crucial for performing stock updates and transaction inserts securely.
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to validate price against canonical data
async function validateAndFetchCanonicalData(cart: CartItemPayload[]) {
    const inventoryIds = cart.filter(i => i.type === 'inventory' && !i.isGiveaway).map(i => i.sourceId);
    const planIds = cart.filter(i => i.type === 'membership').map(i => i.sourceId);

    const [
        { data: inventoryData, error: invError },
        { data: planData, error: planError },
    ] = await Promise.all([
        inventoryIds.length > 0 ? supabaseAdmin.from('inventory_items').select('id, price, stock, name').in('id', inventoryIds) : { data: [], error: null },
        planIds.length > 0 ? supabaseAdmin.from('membership_plans').select('id, price, name').in('id', planIds) : { data: [], error: null },
    ]);

    if (invError || planError) {
        throw new Error("Failed to fetch canonical prices.");
    }

    const canonicalPrices = new Map<string, { price: number, stock?: number, name: string }>();
    inventoryData?.forEach(item => canonicalPrices.set(item.id, { price: item.price, stock: item.stock, name: item.name }));
    planData?.forEach(plan => canonicalPrices.set(plan.id, { price: plan.price, name: plan.name }));

    // Validate all items in the cart
    for (const item of cart) {
        if (item.isGiveaway) continue; // Skip price validation for giveaways

        const canonical = canonicalPrices.get(item.sourceId);
        
        if (!canonical) {
            throw new Error(`Item ID ${item.sourceId} not found in database.`);
        }
        
        // CRITICAL SECURITY CHECK: Validate original price
        if (Math.abs(item.originalPrice - canonical.price) > PRICE_TOLERANCE) {
            console.error(`Price mismatch for ${item.name}. Client original price: ${item.originalPrice}, Canonical price: ${canonical.price}`);
            throw new Error(`Price validation failed for ${item.name}. Original price mismatch.`);
        }
        
        // CRITICAL SECURITY CHECK: Validate paid price against original price (discount check)
        if (item.price > item.originalPrice + PRICE_TOLERANCE) {
            console.error(`Price paid is higher than original price for ${item.name}. Paid: ${item.price}, Original: ${item.originalPrice}`);
            throw new Error(`Price validation failed for ${item.name}. Paid price too high.`);
        }
        
        // CRITICAL SECURITY CHECK: Validate stock for inventory items
        if (item.type === 'inventory' && canonical.stock !== undefined) {
            if (canonical.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}. Required: ${item.quantity}, Available: ${canonical.stock}`);
            }
        }
    }
    
    return canonicalPrices;
}

// Helper to calculate totals securely on the server
function calculateSecureTotals(cart: CartItemPayload[], discountPercent: number) {
    const payableCart = cart.filter(item => !item.isGiveaway);
    
    // Use the price *paid* (item.price) for subtotal calculation, as this already incorporates any allowed manual price override (discount)
    const rawSubtotal = payableCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const discountFactor = discountPercent / 100;
    
    // Calculate discount based on the raw subtotal (using the price paid)
    const discountAmount = rawSubtotal * discountFactor;
    
    // Calculate taxable subtotal (only inventory items)
    const rawTaxableSubtotal = payableCart
        .filter(item => item.type === 'inventory')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
        
    // Apply discount only to the taxable subtotal
    const discountedTaxableSubtotal = rawTaxableSubtotal * (1 - discountFactor);
        
    const calculatedTax = discountedTaxableSubtotal * TAX_RATE;
    const discountedSubtotal = rawSubtotal - discountAmount;
    const finalTotal = discountedSubtotal + calculatedTax;
    
    return {
        subtotal: rawSubtotal,
        discountAmount,
        tax: calculatedTax,
        total: parseFloat(finalTotal.toFixed(2)), // Round final total
    };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 1. Authentication Check (Ensure user is staff/owner)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: corsHeaders });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Use the standard Supabase client (not admin) to verify the JWT and get user info
  const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: corsHeaders });
  }
  
  // Fetch user profile to check role (requires RLS to be set up correctly for staff SELECT)
  const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, member_code, first_name, last_name')
      .eq('id', user.id)
      .single();
      
  const userRole = profile?.role;
  if (!userRole || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'cashier')) {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not authorized staff' }), { status: 403, headers: corsHeaders });
  }

  // 2. Parse Payload
  let payload: CheckoutPayload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: corsHeaders });
  }
  
  const { cart, memberId, paymentMethod, discountPercent, isInitialRegistration } = payload;
  
  if (!cart || cart.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart cannot be empty' }), { status: 400, headers: corsHeaders });
  }

  try {
    // 3. Server-Side Validation (Price, Stock, Canonical Data)
    const canonicalPrices = await validateAndFetchCanonicalData(cart);
    
    // CRITICAL SECURITY CHECK: Check for manual price overrides by Cashiers
    const hasManualPriceOverride = cart.some(item => 
        !item.isGiveaway && 
        Math.abs(item.price - item.originalPrice) > PRICE_TOLERANCE
    );
    
    if (hasManualPriceOverride && userRole === 'cashier') {
        throw new Error("Forbidden: Cashiers are not authorized to apply manual price overrides.");
    }
    
    // 4. Secure Calculation of Final Total
    const { total } = calculateSecureTotals(cart, discountPercent);
    
    // 5. Fetch Member Details (if applicable)
    let memberProfile: { id: string, member_code: string | null, first_name: string | null, last_name: string | null } | null = null;
    if (memberId) {
        const { data: memberData, error: memberError } = await supabaseAdmin
            .from('profiles')
            .select('id, member_code, first_name, last_name')
            .eq('id', memberId)
            .single();
            
        if (memberError || !memberData) {
            throw new Error("Selected member not found.");
        }
        memberProfile = memberData;
    }
    
    const finalMemberId = memberProfile?.member_code || memberProfile?.id || 'GUEST';
    const finalMemberName = memberProfile ? `${memberProfile.first_name} ${memberProfile.last_name}` : 'Guest Customer';
    
    // 6. Transaction Type and Description
    const hasMembership = cart.some(item => item.type === 'membership');
    const hasInventory = cart.some(item => item.type === 'inventory');
    
    let transactionType: 'Membership' | 'POS Sale' | 'Mixed Sale';
    if (hasMembership && hasInventory) {
        transactionType = 'Mixed Sale';
    } else if (hasMembership) {
        transactionType = 'Membership';
    } else {
        transactionType = 'POS Sale';
    }
    
    const itemDescription = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    
    // 7. Perform Inventory Stock Reduction (using RPC for safety)
    const inventoryItemsToReduce = cart.filter(item => item.type === 'inventory' && item.quantity > 0 && canonicalPrices.get(item.sourceId)?.stock !== undefined);
    
    await Promise.all(inventoryItemsToReduce.map(async item => {
        const { error: rpcError } = await supabaseAdmin.rpc('decrement_inventory_stock', {
            item_id: item.sourceId,
            quantity_to_decrement: item.quantity,
        });
        
        if (rpcError) {
            console.error("Inventory RPC error:", rpcError);
            throw new Error(`Failed to update stock for ${item.name}.`);
        }
    }));
    
    // 8. Perform Membership Renewal (if applicable and not initial registration)
    if (memberProfile && hasMembership && !isInitialRegistration) {
        const membershipItems = cart.filter(item => item.type === 'membership');
        
        for (const item of membershipItems) {
            const planId = item.sourceId;
            for (let i = 0; i < item.quantity; i++) {
                // Call the renewal utility (which uses the admin client implicitly via RPC/DB access)
                const { error: renewError } = await supabaseAdmin.rpc('renew_member_plan_rpc', {
                    p_profile_id: memberProfile.id,
                    p_plan_id: planId,
                });
                
                if (renewError) {
                    console.error("Renewal RPC error:", renewError);
                    throw new Error(`Failed to renew membership for ${memberProfile.first_name}.`);
                }
            }
        }
    }
    
    // 9. Record Transaction
    const transactionRecord = {
        member_id: finalMemberId,
        member_name: finalMemberName,
        type: transactionType,
        item_description: itemDescription,
        items_data: cart, // Store the full cart data for reversal/details
        amount: total,
        payment_method: paymentMethod,
        transaction_date: new Date().toISOString().substring(0, 10), // YYYY-MM-DD
    };
    
    const { data: txData, error: txError } = await supabaseAdmin
        .from('transactions')
        .insert(transactionRecord)
        .select('id')
        .single();
        
    if (txError || !txData) {
        console.error("Transaction insert error:", txError);
        throw new Error("Failed to record final transaction.");
    }

    // 10. Success Response
    return new Response(JSON.stringify({ 
        transactionId: txData.id, 
        total: total,
        memberId: finalMemberId,
        memberName: finalMemberName,
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("Checkout Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});