import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    console.log('Checking meetings for date:', tomorrowDateString);

    // Fetch meetings happening tomorrow
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, title, meeting_date, meeting_time, location, owner_id')
      .eq('meeting_date', tomorrowDateString);

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      throw meetingsError;
    }

    console.log('Found meetings:', meetings?.length || 0);

    if (!meetings || meetings.length === 0) {
      return new Response(JSON.stringify({ message: 'No meetings tomorrow', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group meetings by owner_id
    const meetingsByOwner = meetings.reduce((acc, meeting) => {
      if (!acc[meeting.owner_id]) {
        acc[meeting.owner_id] = [];
      }
      acc[meeting.owner_id].push(meeting);
      return acc;
    }, {} as Record<string, typeof meetings>);

    let notificationsSent = 0;

    // For each owner, create in-app notifications
    for (const [ownerId, ownerMeetings] of Object.entries(meetingsByOwner)) {
      for (const meeting of ownerMeetings) {
        // Create notification message
        const timeStr = meeting.meeting_time ? ` в ${meeting.meeting_time.slice(0, 5)}` : '';
        const locationStr = meeting.location ? ` (${meeting.location})` : '';
        const notificationMessage = `Напоминание: завтра встреча "${meeting.title}"${timeStr}${locationStr}`;

        console.log('Creating notification for user:', ownerId, 'Meeting:', meeting.title);

        // Insert notification into messages table as system notification
        // We'll use a special approach - send message from the user to themselves
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: ownerId,
            receiver_id: ownerId,
            content: `🔔 ${notificationMessage}`,
            is_read: false
          });

        if (messageError) {
          console.error('Error creating notification:', messageError);
        } else {
          notificationsSent++;
        }
      }
    }

    console.log('Notifications sent:', notificationsSent);

    return new Response(JSON.stringify({ 
      message: 'Reminders processed', 
      meetingsFound: meetings.length,
      notificationsSent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meeting-reminders function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
