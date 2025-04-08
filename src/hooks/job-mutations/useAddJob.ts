
import { Job } from "@/types/job";
import { prepareJobForInsertion, transformDatabaseJobToJobObject } from "./utils/job-data-preparation";
import { insertJobToDatabase } from "./utils/job-db-operations";
import { calculateRates, generateInternalTitle, getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";

export function useAddJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const addJob = async (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
    try {
      console.log("Starting addJob with data:", jobData);
      
      // Calculate the values we'll need for the final Job object
      const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
      const { high, medium, low } = calculateRates(jobData.rate);
      const workDetails = await getWorkDetails(jobData.locale);
      const payDetails = await getPayDetails(jobData.locale);
      const m1 = generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
      const m2 = generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
      const m3 = generateM3(jobData.videoQuestions);
      
      console.log("Generated data:", { internalTitle, rates: { high, medium, low } });
      
      // Prepare job data for insertion
      const preparedJobData = await prepareJobForInsertion(jobData);
      
      // Insert job into database
      const insertedJob = await insertJobToDatabase(preparedJobData);
      
      console.log("Job added successfully:", insertedJob);
      
      // Transform the returned data to match our Job interface
      const newJob = transformDatabaseJobToJobObject(
        insertedJob,
        internalTitle,
        high,
        medium,
        low,
        workDetails,
        payDetails,
        m1,
        m2,
        m3
      );

      // Update local state
      setJobs([...jobs, newJob]);
      
      return insertedJob.id;
    } catch (error) {
      console.error("Error in useAddJob:", error);
      // Note: We're not showing a toast here because it's better to handle this
      // in the FormProcessor to prevent duplicate toasts
      throw error;
    }
  };

  return addJob;
}
