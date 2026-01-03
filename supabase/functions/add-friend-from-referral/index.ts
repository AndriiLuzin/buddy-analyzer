import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AddFriendRequest {
  referrerId: string;
  friendInfo: {
    firstName: string;
    lastName: string;
    birthday: string | null;
  };
  profile: {
    category: string;
    description: string;
  };
  answers: number[];
  newUserId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { referrerId, friendInfo, profile, answers, newUserId }: AddFriendRequest = await req.json();

    console.log('Adding friend from referral:', { referrerId, friendInfo, profile });

    // Get referrer's profile for matching and reverse friend creation
    const { data: referrerProfile, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('quiz_answers, category, description, first_name, last_name, birthday')
      .eq('user_id', referrerId)
      .maybeSingle();

    if (referrerError) {
      console.error('Error fetching referrer profile:', referrerError);
    }

    // Calculate match score based on answer similarity
    let matchScore = 0;
    if (referrerProfile?.quiz_answers) {
      const referrerAnswers = referrerProfile.quiz_answers as number[];
      let matches = 0;
      for (let i = 0; i < Math.min(answers.length, referrerAnswers.length); i++) {
        if (answers[i] === referrerAnswers[i]) matches++;
      }
      matchScore = Math.round((matches / answers.length) * 100);
    }

    // Generate a UUID for the friend if not provided
    const friendUserId = newUserId || crypto.randomUUID();

    // Check if friend with same name already exists for this referrer
    const { data: existingFriend } = await supabaseAdmin
      .from('friends')
      .select('id')
      .eq('owner_id', referrerId)
      .eq('friend_name', friendInfo.firstName)
      .eq('friend_last_name', friendInfo.lastName)
      .maybeSingle();

    if (existingFriend) {
      console.log('Friend already exists, updating instead of inserting');
      const { error: updateError } = await supabaseAdmin
        .from('friends')
        .update({
          friend_birthday: friendInfo.birthday,
          friend_category: profile.category,
          friend_description: profile.description,
          friend_quiz_answers: answers,
          match_score: matchScore
        })
        .eq('id', existingFriend.id);

      if (updateError) {
        console.error('Error updating friend:', updateError);
        throw updateError;
      }
    } else {
      // Add as friend to referrer (referrer sees the new user)
      const { error: insertError } = await supabaseAdmin
        .from('friends')
        .insert({
          owner_id: referrerId,
          friend_user_id: friendUserId,
          friend_name: friendInfo.firstName,
          friend_last_name: friendInfo.lastName,
          friend_birthday: friendInfo.birthday,
          friend_category: profile.category,
          friend_description: profile.description,
          friend_quiz_answers: answers,
          match_score: matchScore
        });

      if (insertError) {
        console.error('Error inserting friend:', insertError);
        throw insertError;
      }
    }

    console.log('Friend added successfully to referrer');

    // Create notification for the referrer
    const friendFullName = `${friendInfo.firstName} ${friendInfo.lastName}`.trim();
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: referrerId,
        type: 'new_friend',
        title: 'Новый друг добавлен!',
        message: `${friendFullName} заполнил анкету по вашей ссылке`,
        data: {
          friend_name: friendFullName,
          friend_category: profile.category,
          match_score: matchScore,
          friend_user_id: friendUserId
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    } else {
      console.log('Notification created for referrer');
    }

    // Create reverse friendship - add referrer as friend to the new user (new user sees referrer)
    // Only if the new user has an actual account
    if (newUserId && referrerProfile) {
      const { error: reverseError } = await supabaseAdmin
        .from('friends')
        .insert({
          owner_id: newUserId,
          friend_user_id: referrerId,
          friend_name: referrerProfile.first_name,
          friend_last_name: referrerProfile.last_name || '',
          friend_birthday: referrerProfile.birthday || null,
          friend_category: referrerProfile.category || 'good_buddy',
          friend_description: referrerProfile.description || null,
          friend_quiz_answers: referrerProfile.quiz_answers || null,
          match_score: matchScore
        });

      if (reverseError) {
        console.error('Error inserting reverse friendship:', reverseError);
      } else {
        console.log('Reverse friendship added successfully');
      }
    }

    return new Response(
      JSON.stringify({ success: true, matchScore }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in add-friend-from-referral:', error);
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