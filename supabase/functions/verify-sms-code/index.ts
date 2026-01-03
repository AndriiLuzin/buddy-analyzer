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

    // Initialize Supabase client
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

    // Create or sign in user with phone
    // Generate a random password for the user (they'll use SMS for auth)
    const randomPassword = crypto.randomUUID();
    
    // Try to sign up first
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      phone: normalizedPhone,
      phone_confirm: true,
      password: randomPassword,
      user_metadata: {
        name: name || '',
        phone: normalizedPhone,
      },
    });

    let userId: string;
    let isNewUser = false;

    if (signUpError && signUpError.message?.includes('already been registered')) {
      // User exists, find them
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.phone === normalizedPhone);
      
      if (existingUser) {
        userId = existingUser.id;
        console.log("Existing user found:", userId);
      } else {
        console.error("Could not find existing user");
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (signUpError) {
      console.error("Error creating user:", signUpError);
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      userId = signUpData.user!.id;
      isNewUser = true;
      console.log("New user created:", userId);
    }

    // Generate a session token using signInWithPassword with admin
    // We need to use a different approach - generate a magic link or custom token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `${normalizedPhone.replace('+', '')}@phone.buddybe.app`,
    });

    // As a workaround, we'll generate a one-time token
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: `${normalizedPhone.replace('+', '')}@phone.buddybe.app`,
    });

    // Delete the verification record
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('id', verification.id);

    console.log("Verification successful for user:", userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
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
