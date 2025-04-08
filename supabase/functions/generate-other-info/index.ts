
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse request body
  const { jobDescription } = await req.json();

  // Validate inputs
  if (!jobDescription) {
    return new Response(
      JSON.stringify({ error: "Job description is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create prompt for OpenAI
    const prompt = `Extract any cultural or industry-relevant details about the job from the following job description and present them as a bullet list. This is meant to be a list for the candidate to understand more about the role that is not the main skills or duties. Exclude information related to contract type, soft-skills, working hours, productivity expectations, personality types, payment terms, legal requirements, and the main skills. We want to focus on sharing about the industry, the type of platform, or type of product expertise the client wants. Focus on finding these things in the job description you are given, do not make things up.

Example output, must be in plain text:
- Industry Background: Game development
- Product Background: Educational game development
- Technology Background: AI integration

Return this output and nothing else matching the example best you can, no other explanations or additional text is needed.

Job Description:
${jobDescription}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a recruiting assistant that extracts industry and cultural details from job descriptions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const otherInfo = data.choices[0].message.content.trim();

    console.log('Successfully generated other information');

    // Return the generated other information
    return new Response(
      JSON.stringify({ otherInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-other-info function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
