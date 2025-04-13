
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { mapJobToDatabase } from "./job-data-preparation";
import { toast } from "@/components/ui/use-toast";
import { uuid } from "@/utils/uuid";

/**
 * Insert a new job into the database
 */
export async function insertJob(job: Job): Promise<Job | null> {
  try {
    const jobData = mapJobToDatabase(job);
    
    // Verify the status_id exists in job_statuses table before inserting
    if (jobData.status_id) {
      const { data: statusExists } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('id', jobData.status_id)
        .maybeSingle();
      
      if (!statusExists) {
        console.warn(`Status ID ${jobData.status_id} not found in job_statuses table - attempting to resolve`);
        
        // Attempt to find a valid status by name instead
        const { data: statusData } = await supabase
          .from('job_statuses')
          .select('id')
          .eq('name', jobData.status)
          .maybeSingle();
        
        if (statusData?.id) {
          console.log(`Found valid status ID for "${jobData.status}": ${statusData.id}`);
          jobData.status_id = statusData.id;
        } else {
          console.log(`No valid status found for "${jobData.status}" - creating new status`);
          
          // Create a new UUID for the status if needed
          if (!jobData.status_id || jobData.status_id.trim() === '') {
            jobData.status_id = uuid();
          }
          
          // No valid status found, we need to create one first
          const { data: newStatus, error: statusError } = await supabase
            .from('job_statuses')
            .insert({ id: jobData.status_id, name: jobData.status })
            .select()
            .single();
          
          if (statusError) {
            console.error("Failed to create job status:", statusError);
            throw new Error(`Failed to create job status: ${statusError.message}`);
          }
          
          console.log(`Created new status with ID ${newStatus.id} for "${jobData.status}"`);
        }
      } else {
        console.log(`Confirmed valid status ID: ${jobData.status_id} for "${jobData.status}"`);
      }
    } else if (jobData.status) {
      // If no status_id is provided but we have a status name, try to find it
      const { data: statusData } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('name', jobData.status)
        .maybeSingle();
        
      if (statusData?.id) {
        jobData.status_id = statusData.id;
      } else {
        // Create a new status if it doesn't exist
        const newStatusId = uuid();
        const { error: statusError } = await supabase
          .from('job_statuses')
          .insert({ id: newStatusId, name: jobData.status })
          .select()
          .single();
          
        if (statusError) {
          console.error("Failed to create job status:", statusError);
          throw new Error(`Failed to create job status: ${statusError.message}`);
        }
        
        jobData.status_id = newStatusId;
      }
    } else {
      console.warn("No status information provided for job - using default 'Active' status");
      
      // Try to find the 'Active' status
      const { data: activeStatus } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('name', 'Active')
        .maybeSingle();
        
      if (activeStatus?.id) {
        jobData.status_id = activeStatus.id;
        jobData.status = 'Active';
      } else {
        // Create the Active status if it doesn't exist
        const activeStatusId = uuid();
        const { error: statusError } = await supabase
          .from('job_statuses')
          .insert({ id: activeStatusId, name: 'Active' })
          .select()
          .single();
          
        if (statusError) {
          console.error("Failed to create default Active status:", statusError);
          throw new Error(`Failed to create default Active status: ${statusError.message}`);
        }
        
        jobData.status_id = activeStatusId;
        jobData.status = 'Active';
      }
    }
    
    // Now that we've verified/created the status, insert the job
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData]) // Use an array here for the insert
      .select()
      .single();
    
    if (error) {
      console.error("Database error inserting job:", error);
      throw new Error(`Failed to insert job: ${error.message}`);
    }
    
    console.log("Job inserted successfully:", data.id);
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
    
    // Verify the status_id exists for updating
    if (jobData.status_id) {
      const { data: statusExists } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('id', jobData.status_id)
        .maybeSingle();
      
      if (!statusExists) {
        console.warn(`Status ID ${jobData.status_id} not found - creating or finding valid status`);
        
        // Try to find status by name
        const { data: statusByName } = await supabase
          .from('job_statuses')
          .select('id')
          .eq('name', jobData.status)
          .maybeSingle();
        
        if (statusByName?.id) {
          console.log(`Found status by name: ${statusByName.id}`);
          jobData.status_id = statusByName.id;
        } else {
          // Create new status
          const newStatusId = jobData.status_id || uuid();
          const { data: newStatus, error: statusError } = await supabase
            .from('job_statuses')
            .insert({ 
              id: newStatusId,
              name: jobData.status 
            })
            .select()
            .single();
          
          if (statusError) {
            console.error("Status creation error:", statusError);
            throw new Error(`Failed to create job status during update: ${statusError.message}`);
          }
          
          console.log(`Created new status for update: ${newStatus.id}`);
          jobData.status_id = newStatus.id;
        }
      }
    } else if (jobData.status) {
      // If no status_id but we have a status name, try to find or create it
      const { data: statusData } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('name', jobData.status)
        .maybeSingle();
        
      if (statusData?.id) {
        jobData.status_id = statusData.id;
      } else {
        // Create a new status
        const newStatusId = uuid();
        const { error: statusError } = await supabase
          .from('job_statuses')
          .insert({ id: newStatusId, name: jobData.status })
          .select()
          .single();
          
        if (statusError) {
          console.error("Failed to create job status:", statusError);
          throw new Error(`Failed to create job status: ${statusError.message}`);
        }
        
        jobData.status_id = newStatusId;
      }
    }
    
    // Update the job with verified status_id
    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', job.id)
      .select()
      .single();
    
    if (error) {
      console.error("Database error updating job:", error);
      throw new Error(`Failed to update job: ${error.message}`);
    }
    
    console.log("Job updated successfully:", data.id);
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
    // First check if job exists
    const { data: jobExists, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();
      
    if (checkError || !jobExists) {
      console.error("Job not found or error checking job:", checkError);
      throw new Error(`Job not found with ID: ${jobId}`);
    }
    
    // Then delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error("Database error deleting job:", error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
    
    console.log("Job deleted successfully:", jobId);
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
