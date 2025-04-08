
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { mapJobToDatabase } from "./job-data-preparation";
import { toast } from "@/components/ui/use-toast";

/**
 * Insert a new job into the database
 */
export async function insertJob(job: Job): Promise<Job | null> {
  try {
    const jobData = mapJobToDatabase(job);
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData]) // Use an array here for the insert
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as unknown as Job;
  } catch (error: any) {
    console.error("Error inserting job:", error.message);
    toast({
      title: "Error Creating Job",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Update an existing job in the database
 */
export async function updateJob(job: Job): Promise<Job | null> {
  try {
    const jobData = mapJobToDatabase(job);
    
    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', job.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as unknown as Job;
  } catch (error: any) {
    console.error("Error updating job:", error.message);
    toast({
      title: "Error Updating Job",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Delete a job from the database
 */
export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error deleting job:", error.message);
    toast({
      title: "Error Deleting Job",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}
