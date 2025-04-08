
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
            content: 'You are a technical interviewer who specializes in creating concise, technical video interview questions.'
          },
          { 
            role: 'user', 
            content: `Instructions:Create three concise, complex technical questions based on the skills required for the role: ${minSkills} Each question must be no longer than 20 words. The questions should assess candidates' technical acumen and allow them to elaborate on their hands-on experience with the main skills that require the most years and most expert or advanced levels.Example Questions:How do you optimize Spark jobs for performance in Azure Databricks?Can you explain how to handle streaming data in Azure Databricks?How do you orchestrate data pipelines in Azure Data Factory?Response Format:Provide only the three questions.Do not include any additional text, acknowledgments, or explanations.Example Response:How do you optimize Spark jobs for performance in Azure Databricks?Can you explain how to handle streaming data in Azure Databricks?How do you orchestrate data pipelines in Azure Data Factory?` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const videoQuestions = data.choices[0].message.content;

    return new Response(JSON.stringify({ videoQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-video-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
