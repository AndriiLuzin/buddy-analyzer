import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateMessageRequest {
  friendName: string;
  category: string;
  messageType: 'contact' | 'birthday';
  actionType: 'casual' | 'meetup' | 'call' | 'congrats' | 'gift' | 'plan';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { friendName, category, messageType, actionType } = await req.json() as GenerateMessageRequest;

    console.log('Generating message for:', { friendName, category, messageType, actionType });

    let systemPrompt = '';
    let userPrompt = '';

    if (messageType === 'birthday') {
      systemPrompt = `Ты помощник, который генерирует персонализированные поздравления с днём рождения на русском языке. 
Твои сообщения должны быть тёплыми, искренними и подходящими для отправки другу.
Используй эмодзи умеренно. Сообщение должно быть не более 2-3 предложений.`;

      if (actionType === 'congrats') {
        userPrompt = `Напиши искреннее поздравление с днём рождения для ${friendName}. Категория дружбы: ${category}. Сделай его личным и тёплым.`;
      } else if (actionType === 'plan') {
        userPrompt = `Напиши сообщение для ${friendName} с предложением встретиться и отметить день рождения вместе. Категория дружбы: ${category}.`;
      } else {
        userPrompt = `Напиши короткое поздравление с днём рождения для ${friendName}. Категория дружбы: ${category}.`;
      }
    } else {
      systemPrompt = `Ты помощник, который генерирует дружеские сообщения на русском языке для поддержания связи с друзьями.
Твои сообщения должны быть непринуждёнными, естественными и подходящими для мессенджера.
Используй эмодзи умеренно. Сообщение должно быть не более 2-3 предложений.`;

      if (actionType === 'casual') {
        userPrompt = `Напиши дружеское приветствие для ${friendName}. Категория дружбы: ${category}. Это должно быть непринуждённое сообщение чтобы узнать как дела.`;
      } else if (actionType === 'meetup') {
        userPrompt = `Напиши сообщение для ${friendName} с предложением встретиться на кофе или просто провести время вместе. Категория дружбы: ${category}.`;
      } else if (actionType === 'call') {
        userPrompt = `Напиши короткое сообщение для ${friendName} чтобы спросить можно ли позвонить. Категория дружбы: ${category}.`;
      } else {
        userPrompt = `Напиши дружеское сообщение для ${friendName}. Категория дружбы: ${category}.`;
      }
    }

    console.log('Calling Lovable AI with prompts...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Превышен лимит запросов, попробуйте позже.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'Требуется пополнение баланса.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.choices?.[0]?.message?.content;

    console.log('Generated message:', generatedMessage);

    return new Response(JSON.stringify({ message: generatedMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-message function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
