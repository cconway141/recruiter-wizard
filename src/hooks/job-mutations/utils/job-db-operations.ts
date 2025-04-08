
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Define a specific return type to avoid the infinite type instantiation error
type InsertedJobType = {
  id: string;
  internal_title: string;
  candidate_facing_title: string;
  jd: string;
  status: string;
  m1: string;
  m2: string;
  m3: string;
  skills_sought: string;
  min_skills: string;
  linkedin_search: string;
  lir: string;
  client: string;
  client_id: string;
  comp_desc: string;
  rate: number;
  high_rate: number;
  medium_rate: number;
  low_rate: number;
  locale: string;
  locale_id: string;
  owner: string;
  owner_id: string;
  date: string;
  work_details: string;
  pay_details: string;
  other: string;
  video_questions: string;
  screening_questions: string;
  flavor: string;
  flavor_id: string;
  status_id: string;
};

export async function insertJobToDatabase(preparedJob: any): Promise<InsertedJobType> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert(preparedJob)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error inserting job to database:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No data returned from insertion");
    }
    
    return data as InsertedJobType;
  } catch (error) {
    console.error("Database error:", error);
    toast({
      title: "Database Error",
      description: `Failed to save job: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
    throw error;
  }
}
