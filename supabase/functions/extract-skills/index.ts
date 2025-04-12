
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
    const { jobDescription } = await req.json();

    if (!jobDescription || jobDescription.trim() === '') {
      console.error('Error: Job description is empty or missing');
      return new Response(
        JSON.stringify({ error: 'Job description is required and cannot be empty', skills: '' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing job description (${jobDescription.length} chars)`);

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
            content: 'You are a skilled technical recruiter. Extract technical skills from job descriptions precisely according to instructions.' 
          },
          { 
            role: 'user', 
            content: `Please extract and list explicit skills to get the unique explicit technical skills the candidate need in order to qualify for this role. I do not need information on pay, location, benefits, training, etc. Only the specific technical skills needed to qualify, prioritizing platforms, tools, programs, or certifications mentioned in the text that are essential for the candidate to qualify for the role.

Only skills mentioned in the text. Prioritize technical requirements, coding languages, or technical skills for developers, and for non-developer roles you can include required skills that are not as technical like requirements gathering. You can focus on system types like CRM or CMS, only if specified in the text. Exclude any details related to salary, location, benefits, training, or personality traits.

Provide a single keyword or skill per line, do not group or combine similar skills, make these logically sorted with the most critical skill for this role at the top, and condense the list to no more than 10 of the most critical technical skills and requirements from the text provided which are needed. Before you send anything back, double check that there is only a single keyword or skill on each line, and you did not combine any together. Return the list immediately in plain text formatted exactly like this:

-Skill 1
-Skill 2
-Skill 3
-Skill 4
-Skill 5

Here is the job description:
${jobDescription}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorText}`);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', JSON.stringify(data));
      throw new Error('Invalid response from OpenAI API');
    }
    
    const extractedSkills = data.choices[0].message.content;
    console.log('Successfully extracted skills');

    return new Response(JSON.stringify({ skills: extractedSkills }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-skills function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract skills from job description', 
      skills: '' // Return empty skills on error to prevent null errors
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
