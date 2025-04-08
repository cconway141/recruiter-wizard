
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { minSkills } = await req.json();

    if (!minSkills) {
      return new Response(
        JSON.stringify({ error: 'Minimum skills are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a technical interviewer who specializes in creating behavioral interview questions.'
          },
          { 
            role: 'user', 
            content: `Please create three behavior-based interview questions tailored to the specified role based on ${minSkills}. The questions should focus on technical challenges and experiences, starting with prompts like "Tell me about a time when..." or "Describe a situation where...". Keep each question concise, no more than 20 words, focus on the skills with the most years or most advanced and expert level required. Respond only with the three questions—no additional text, acknowledgments, or explanations.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const screeningQuestions = data.choices[0].message.content;

    return new Response(JSON.stringify({ screeningQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-screening-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
