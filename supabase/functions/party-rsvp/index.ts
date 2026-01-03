import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RsvpRequest {
  inviteCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "accepted" | "declined";
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { inviteCode, firstName, lastName, phone, status }: RsvpRequest = await req.json();

    console.log("Processing RSVP for invite code:", inviteCode);

    // Validate input
    if (!inviteCode || !firstName || !lastName || !phone || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the invite and party info
    const { data: invite, error: inviteError } = await supabase
      .from("party_external_invites")
      .select(`
        *,
        party:parties(
          id,
          title,
          owner_id,
          party_date,
          party_time
        )
      `)
      .eq("invite_code", inviteCode)
      .single();

    if (inviteError || !invite) {
      console.error("Invite not found:", inviteError);
      return new Response(
        JSON.stringify({ error: "Invite not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (invite.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "This invite has already been responded to" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the invite with response
    const { error: updateError } = await supabase
      .from("party_external_invites")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        status: status,
        responded_at: new Date().toISOString(),
      })
      .eq("invite_code", inviteCode);

    if (updateError) {
      console.error("Error updating invite:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update response" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invite updated successfully");

    // Create notification for party owner
    const statusText = status === "accepted" ? "принял приглашение" : "отклонил приглашение";
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: invite.party.owner_id,
        type: "party_rsvp",
        title: status === "accepted" ? "Новое подтверждение!" : "Отказ от участия",
        message: `${firstName} ${lastName} ${statusText} на "${invite.party.title}"`,
        data: {
          party_id: invite.party.id,
          invite_id: invite.id,
          guest_name: `${firstName} ${lastName}`,
          phone: phone,
          status: status,
        },
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the whole request if notification fails
    } else {
      console.log("Notification created for party owner");
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in party-rsvp function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
