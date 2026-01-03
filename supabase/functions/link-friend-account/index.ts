import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkAccountRequest {
  userId: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  phone: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, firstName, lastName, birthday, phone }: LinkAccountRequest = await req.json();

    console.log('Linking account for:', { userId, firstName, lastName, birthday });

    // Search for existing friend records with matching name and birthday
    let query = supabaseAdmin
      .from('friends')
      .select('id, owner_id, friend_name, friend_last_name, friend_birthday, friend_user_id, is_verified')
      .eq('friend_name', firstName)
      .eq('friend_last_name', lastName)
      .eq('is_verified', false);

    if (birthday) {
      query = query.eq('friend_birthday', birthday);
    }

    const { data: matchingFriends, error: searchError } = await query;

    if (searchError) {
      console.error('Error searching for matching friends:', searchError);
      throw searchError;
    }

    console.log('Found matching friends:', matchingFriends?.length || 0);

    let linkedCount = 0;
    const notifications: { ownerId: string; friendName: string }[] = [];

    if (matchingFriends && matchingFriends.length > 0) {
      // Update all matching friend records with the new user ID and mark as verified
      for (const friend of matchingFriends) {
        const { error: updateError } = await supabaseAdmin
          .from('friends')
          .update({
            friend_user_id: userId,
            is_verified: true
          })
          .eq('id', friend.id);

        if (updateError) {
          console.error('Error updating friend record:', updateError);
        } else {
          linkedCount++;
          notifications.push({
            ownerId: friend.owner_id,
            friendName: `${friend.friend_name} ${friend.friend_last_name}`
          });
        }
      }

      // Create notifications for each owner whose friend verified
      for (const notif of notifications) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: notif.ownerId,
            type: 'friend_verified',
            title: 'Друг верифицировал аккаунт!',
            message: `${notif.friendName} создал аккаунт и теперь верифицирован`,
            data: {
              friend_name: notif.friendName,
              friend_user_id: userId
            }
          });
      }

      console.log(`Linked ${linkedCount} friend records and created ${notifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        linkedCount,
        notificationsCreated: notifications.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in link-friend-account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});