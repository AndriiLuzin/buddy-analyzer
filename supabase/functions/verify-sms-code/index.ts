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
    // Use a consistent password based on phone
    const consistentPassword = `phone_${normalizedPhone.replace('+', '')}_auth_2024`;
    
    let userId: string;
    let isNewUser = false;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.phone === normalizedPhone || u.email === fakeEmail);
    
    if (existingUser) {
      // User exists
      userId = existingUser.id;
      isNewUser = false;
      console.log("Existing user found:", userId);
      
      // Update password to consistent one so we can sign in
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: consistentPassword,
      });
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
      }
    } else {
      // Create new user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        phone: normalizedPhone,
        phone_confirm: true,
        email_confirm: true,
        password: consistentPassword,
        user_metadata: {
          name: name || '',
          phone: normalizedPhone,
        },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = signUpData.user!.id;
      isNewUser = true;
      console.log("New user created:", userId);
    }

    // Now sign in the user to get tokens
    // Create a new client with anon key for signing in
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: fakeEmail,
      password: consistentPassword,
    });

    if (signInError) {
      console.error("Error signing in user:", signInError);
      // Still return success but without tokens - client will handle
    } else if (signInData.session) {
      accessToken = signInData.session.access_token;
      refreshToken = signInData.session.refresh_token;
      console.log("Session created successfully");
    }

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
        accessToken,
        refreshToken,
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
