import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code, name } = await req.json();

    if (!phone || !code) {
      console.error("Phone and code are required");
      return new Response(
        JSON.stringify({ error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '').startsWith('+') 
      ? phone.replace(/\s/g, '') 
      : `+${phone.replace(/\s/g, '')}`;

    console.log(`Verifying code for: ${normalizedPhone}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the verification record
    const { data: verification, error: findError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (findError) {
      console.error("Error finding verification:", findError);
      return new Response(
        JSON.stringify({ error: "Failed to verify code" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!verification) {
      console.log("Invalid or expired code");
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    await supabase
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    const fakeEmail = `${normalizedPhone.replace('+', '')}@phone.buddybe.app`;
    
    let isNewUser = false;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.phone === normalizedPhone || u.email === fakeEmail);
    
    if (existingUser) {
      // User exists
      isNewUser = false;
      console.log("Existing user found:", existingUser.id);
    } else {
      // New user
      isNewUser = true;
      console.log("New user - will need to create account with password");
    }

    // Delete the verification record
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('id', verification.id);

    console.log("Verification successful, isNewUser:", isNewUser);

    return new Response(
      JSON.stringify({ 
        success: true, 
        isNewUser,
        message: "Phone verified successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in verify-sms-code:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
