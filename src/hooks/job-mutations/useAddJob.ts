
import { Job } from "@/types/job";
import { prepareJobForInsertion, transformDatabaseJobToJobObject } from "./utils/job-data-preparation";
import { insertJobToDatabase } from "./utils/job-db-operations";
import { calculateRates, generateInternalTitle } from "@/utils/jobUtils";

export function useAddJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const addJob = async (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
    try {
      console.log("Starting addJob with data:", jobData);
      
      // Calculate the values we'll need for the final Job object
      const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
      const { high, medium, low } = calculateRates(jobData.rate);
      
      // Prepare job data for insertion including the calculated values
      const preparedJobData = await prepareJobForInsertion({
        ...jobData,
        internalTitle, // Add internal title to the job data
      });
      
      // Insert job into database
      const insertedJob = await insertJobToDatabase(preparedJobData);
      
      console.log("Job added successfully:", insertedJob);
      
      // Transform the returned data to match our Job interface
      const newJob = {
        id: insertedJob.id,
        internalTitle: insertedJob.internal_title || internalTitle,
        candidateFacingTitle: insertedJob.candidate_facing_title,
        jd: insertedJob.jd,
        status: insertedJob.status,
        skillsSought: insertedJob.skills_sought,
        minSkills: insertedJob.min_skills,
        lir: insertedJob.lir,
        client: insertedJob.client,
        clientId: insertedJob.client_id,
        compDesc: insertedJob.comp_desc,
        rate: insertedJob.rate,
        highRate: insertedJob.high_rate || high,
        mediumRate: insertedJob.medium_rate || medium,
        lowRate: insertedJob.low_rate || low,
        locale: insertedJob.locale,
        localeId: insertedJob.locale_id,
        owner: insertedJob.owner,
        ownerId: insertedJob.owner_id,
        date: insertedJob.date,
        workDetails: insertedJob.work_details,
        payDetails: insertedJob.pay_details,
        other: insertedJob.other || "",
        videoQuestions: insertedJob.video_questions,
        screeningQuestions: insertedJob.screening_questions,
        flavor: insertedJob.flavor,
        flavorId: insertedJob.flavor_id,
        statusId: insertedJob.status_id,
        m1: insertedJob.m1,
        m2: insertedJob.m2,
        m3: insertedJob.m3
      };

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
