
import { useCallback } from "react";
import { Job } from "@/types/job";
import { prepareJobForCreate } from "./utils/job-data-preparation";
import { insertJob } from "./utils/job-db-operations";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook for adding a new job
 */
export function useAddJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  /**
   * Add a new job to the state and database
   */
  const addJob = useCallback(
    async (jobToAdd: Omit<
      Job,
      | "id"
      | "internalTitle"
      | "highRate"
      | "mediumRate"
      | "lowRate"
      | "workDetails"
      | "payDetails"
      | "m1"
      | "m2"
      | "m3"
    >) => {
      try {
        console.log("Adding job with data:", jobToAdd);
        
        // Step 1: Prepare the job data with calculated fields
        const preparedJobPromise = await prepareJobForCreate(jobToAdd);
        console.log("Job prepared successfully:", preparedJobPromise);
        
        // Step 2: Update state immediately for a responsive UI
        const newJob: Job = {
          ...preparedJobPromise,
          // Add default values for the omitted properties
          workDetails: jobToAdd.workDetails || "",
          payDetails: jobToAdd.payDetails || "",
          m1: jobToAdd.m1 || "",
          m2: jobToAdd.m2 || "",
          m3: jobToAdd.m3 || "",
        };

        console.log("Generated job object for state:", newJob);
        setJobs([...jobs, newJob]);
        console.log("Added job to local state, now saving to database...");

        // Step 3: Insert into database
        const savedJob = await insertJob(newJob);
        console.log("Database response:", savedJob);

        if (!savedJob) {
          // If the database operation failed, revert the state change
          console.error("Failed to save job to database, reverting state");
          const filteredJobs = jobs.filter((job) => job.id !== newJob.id);
          setJobs(filteredJobs);
          throw new Error("Failed to save job to database");
        }

        toast({
          title: "Job Added",
          description: "The job has been successfully created.",
        });

        console.log("Job added successfully:", newJob.internalTitle);
        return newJob;
      } catch (error: any) {
        console.error("Error adding job:", error);
        toast({
          title: "Error Adding Job",
          description: error.message || "Failed to add job",
          variant: "destructive",
        });
        return null;
      }
    },
    [jobs, setJobs]
  );

  return addJob;
}
