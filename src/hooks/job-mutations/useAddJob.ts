
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
    async (
      jobToAdd: Omit<
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
      >
    ) => {
      try {
        // Step 1: Prepare the job data with calculated fields
        const preparedJob = prepareJobForCreate(jobToAdd);

        // Step 2: Update state immediately for a responsive UI
        const newJob: Job = {
          ...preparedJob,
          // Add default values for the omitted properties
          workDetails: "",
          payDetails: "",
          m1: "",
          m2: "",
          m3: "",
          linkedinSearch: jobToAdd.linkedinSearch || "",
        };

        setJobs([...jobs, newJob]);

        // Step 3: Insert into database
        const savedJob = await insertJob(newJob);

        if (!savedJob) {
          // If the database operation failed, revert the state change
          const filteredJobs = jobs.filter((job) => job.id !== newJob.id);
          setJobs(filteredJobs);
          throw new Error("Failed to save job to database");
        }

        toast({
          title: "Job Added",
          description: "The job has been successfully created.",
        });

        return newJob;
      } catch (error: any) {
        console.error("Error adding job:", error);
        toast({
          title: "Error Adding Job",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    },
    [jobs, setJobs]
  );

  return addJob;
}
