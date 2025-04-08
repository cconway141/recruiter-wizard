
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const defaultPrompts = [
  {
    name: "Video Questions",
    description: "Generate questions for the candidate's video response",
    prompt_text: "Instructions:Create three concise, complex technical questions based on the skills required for the role: ${minSkills} Each question must be no longer than 20 words. The questions should assess candidates' technical acumen and allow them to elaborate on their hands-on experience with the main skills that require the most years and most expert or advanced levels.Example Questions:How do you optimize Spark jobs for performance in Azure Databricks?Can you explain how to handle streaming data in Azure Databricks?How do you orchestrate data pipelines in Azure Data Factory?Response Format:Provide only the three questions.Do not include any additional text, acknowledgments, or explanations.Example Response:How do you optimize Spark jobs for performance in Azure Databricks?Can you explain how to handle streaming data in Azure Databricks?How do you orchestrate data pipelines in Azure Data Factory?"
  },
  {
    name: "Screening Questions",
    description: "Generate behavioral interview questions for initial screening",
    prompt_text: "Please create three behavior-based interview questions tailored to the specified role based on ${minSkills}. The questions should focus on technical challenges and experiences, starting with prompts like \"Tell me about a time when...\" or \"Describe a situation where...\". Keep each question concise, no more than 20 words, focus on the skills with the most years or most advanced and expert level required. Respond only with the three questions—no additional text, acknowledgments, or explanations."
  },
  {
    name: "Other Information",
    description: "Extract additional context from the job description",
    prompt_text: "Analyze the following job description: ${jobDescription}\n\nExtract any other relevant information about the industry, product, specific environment, or additional context that candidates should know beyond the basic job requirements. Focus on information that helps understand the company's domain, values, work culture, or the specific market they operate in. Keep your response concise and focused on only the most relevant contextual information (max 150 words)."
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if prompts already exist
    const { data: existingPrompts, error: checkError } = await supabase
      .from('prompts')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // Only insert if no prompts exist
    if (!existingPrompts || existingPrompts.length === 0) {
      // Insert default prompts
      const { data, error } = await supabase
        .from('prompts')
        .insert(defaultPrompts.map((prompt, index) => ({
          id: index + 1,
          ...prompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Default prompts created successfully', 
        data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Prompts already exist, no action taken' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error creating default prompts:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
