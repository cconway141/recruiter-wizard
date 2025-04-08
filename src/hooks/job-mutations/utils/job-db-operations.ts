
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Locale, Flavor, JobStatus } from "@/types/job";

// Define valid table names to fix type errors
type ValidTableName = "clients" | "flavors" | "locales" | "job_statuses" | "profiles";

/**
 * Look up an entity ID by its name from a specific table
 */
export async function lookupEntityByName(
  tableName: ValidTableName,
  columnName: "name" | "display_name",
  value: string
): Promise<string | null> {
  try {
    console.log(`Looking up ${tableName}.${columnName} with value "${value}"`);
    
    // Use explicit typing on supabase.from to avoid deep instantiation
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq(columnName, value)
      .single();
    
    if (error) {
      console.error(`Error looking up ${tableName}.${columnName}:`, error);
      return null;
    }
    
    // Add null check for data before accessing it
    if (!data) {
      console.warn(`No match found for ${tableName}.${columnName} = "${value}"`);
      return null;
    }
    
    console.log(`Found ${tableName} id:`, data.id);
    return data.id;
  } catch (err) {
    console.error(`Exception in lookupEntityByName for ${tableName}:`, err);
    return null;
  }
}

/**
 * Inserts a job into the database and returns the inserted record
 */
export async function insertJobToDatabase(jobData: any) {
  try {
    console.log("Inserting job with data:", jobData);
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting job:", error);
      toast({
        title: "Error Creating Job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    
    if (!data) {
      const errorMsg = "Job was inserted but no data was returned";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log("Job inserted successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception in insertJobToDatabase:", err);
    toast({
      title: "Error Creating Job",
      description: err instanceof Error ? err.message : "Unknown error occurred",
      variant: "destructive",
    });
    throw err;
  }
}

/**
 * Prepares job data for insertion by mapping fields to database columns
 */
export async function prepareJobForInsertion(jobData: any) {
  try {
    const localeId = await lookupEntityByName('locales', 'name', jobData.locale as Locale);
    const flavorId = await lookupEntityByName('flavors', 'name', jobData.flavor as Flavor);
    const statusId = await lookupEntityByName('job_statuses', 'name', jobData.status as JobStatus);
    const clientId = await lookupEntityByName('clients', 'name', jobData.client);
    const ownerId = null; // We're not looking up real users anymore
    
    return {
      internal_title: "TBD", // Will be set later
      candidate_facing_title: jobData.candidateFacingTitle,
      jd: jobData.jd || "",
      status: jobData.status,
      status_id: statusId,
      skills_sought: jobData.skillsSought || "",
      min_skills: jobData.minSkills || "",
      lir: jobData.lir || "",
      client: jobData.client,
      client_id: clientId,
      comp_desc: jobData.compDesc || "",
      rate: jobData.rate || 0,
      high_rate: 0, // Will be calculated later
      medium_rate: 0, // Will be calculated later
      low_rate: 0, // Will be calculated later
      locale: jobData.locale,
      locale_id: localeId,
      owner: jobData.owner || "",
      owner_id: ownerId,
      date: jobData.date || new Date().toISOString().split('T')[0],
      work_details: jobData.workDetails || "",
      pay_details: jobData.payDetails || "",
      other: jobData.other || "",
      video_questions: jobData.videoQuestions || "",
      screening_questions: jobData.screeningQuestions || "",
      flavor: jobData.flavor,
      flavor_id: flavorId,
      
      // These will be generated later, but we need placeholders for the database
      m1: "",
      m2: "",
      m3: "",
      linkedin_search: ""
    };
  } catch (err) {
    console.error("Error preparing job data:", err);
    throw err;
  }
}
