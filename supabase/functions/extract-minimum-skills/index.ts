
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
    const { skillsSought, jobDescription } = await req.json();

    if (!skillsSought || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Skills sought and job description are required' }),
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
            content: 'You are a skilled technical recruiter who evaluates skill requirements and experience levels for job descriptions.' 
          },
          { 
            role: 'user', 
            content: `After each skill you extracted here:
${skillsSought}

include a logically assumed minimum years of experience and skill level in parentheses, formatted as: (Skill Level, X+ yrs). Use this as your information source: ${jobDescription}

For skill levels, choose from Beginner, Advanced Beginner, Intermediate, Advanced, and Expert.Use the following logic for assigning years and levels:Contextual AnalysisUse the role description, seniority level, and project scope as primary factors for estimating years and levels.Use any global years of experience provided (e.g., "6+ years overall") only as general guidance. Do not apply the global years uniformly across all skills. Each skill must be assessed and adjusted based on its role in the job and dependency on other technologies.Skill DependenciesFor directly related skills (e.g., AWS Services, cloud security, infrastructure as code), allow them to influence each other by up to 50%, adjusting their years and levels logically to reflect dependency without making them identical.Unrelated or loosely connected technologies (e.g., programming languages and security practices) should be evaluated independently.Defaults (Last Resort)Only apply defaults when there is no information available in the job description to infer years and level:Beginner: 1 yearAdvanced Beginner: 2 yearsIntermediate: 3 yearsAdvanced: 4 yearsExpert: 5+ yearsIf defaults are used, adjust for role seniority (e.g., for a senior role, a "Beginner" may require 2+ years instead of 1).Skill Level Assignment RulesBeginner: Basic understanding, requires guidance.Advanced Beginner: Can contribute but still needs support.Intermediate: Works independently, supports juniors.Advanced: Designs key solutions, mentors others.Expert: Industry leader, understands broad system impacts.Output RequirementsEnsure each skill is evaluated independently, even if the job description mentions related technologies.Avoid grouping or applying uniform values across multiple skills. Each technology must have a separate line and its own unique years and level based on role and dependencies.Format each skill as follows:Skill Name (Level, X+ yrs)Provide the formatted list without additional explanations or commentary. Make it formatted exactly like this, only a single skill per line.

Example Output
"-Skill 1 (level, #+ yrs)
-Skill 2 (level, #+ yrs)
-Skill 3 (level, #+ yrs)
-Skill 4 (level, #+ yrs)
-Skill 5 (level, #+ yrs)"

before you send this back, double check you assessed all the skills in this list ${skillsSought} independently and they are not all the same level and years, if they are all the same in the output, go back and reassess before responding.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const minSkills = data.choices[0].message.content;

    return new Response(JSON.stringify({ minSkills }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-minimum-skills function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
