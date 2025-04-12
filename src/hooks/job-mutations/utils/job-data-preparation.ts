import { uuid } from "@/utils/uuid";
import { Job } from "@/types/job";
import { calculateRates } from "@/utils/rateUtils";
import { generateInternalTitle } from "@/utils/titleUtils";

/**
 * Prepare job data for creation in the database
 */
export const prepareJobForCreate = async (
  job: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate">
): Promise<Omit<Job, "workDetails" | "payDetails" | "m1" | "m2" | "m3">> => {
  // Validate and set a default job title if missing
  if (!job.candidateFacingTitle) {
    console.warn("No job title provided. Using a default title.");
    job.candidateFacingTitle = "Untitled Position";
  }

  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Generate the internal title using the correct format: ClientAbbr RoleAbbr - Flavor LocaleAbbr
  const internalTitle = await generateInternalTitle(
    job.client,
    job.candidateFacingTitle,
    job.flavor,
    job.locale
  );
  
  // Calculate rates based on the main rate using our utility function
  const rate = Number(job.rate) || 0;
  const { high: highRate, medium: mediumRate, low: lowRate = 0 } = calculateRates(rate);

  return {
    ...job,
    id: uuid(),
    status: job.status || "Active", // Default to "Active" status
    internalTitle,
    highRate,
    mediumRate,
    lowRate,
    date,
    linkedinSearch: job.linkedinSearch || "", // Ensure this property exists
  };
};

/**
 * Map job data to the format expected by Supabase
 */
export const mapJobToDatabase = (job: Job) => {
  return {
    id: job.id,
    internal_title: job.internalTitle,
    candidate_facing_title: job.candidateFacingTitle, // Convert camelCase to snake_case
    jd: job.jd || "",
    status: job.status, // This is a direct string from JobStatus type
    status_id: job.statusId, // This should be the UUID from job_statuses table
    skills_sought: job.skillsSought || "",
    min_skills: job.minSkills || "",
    linkedin_search: job.linkedinSearch || "", // Map the linkedinSearch field
    lir: job.lir || "",
    client: job.client,
    client_id: job.clientId,
    comp_desc: job.compDesc || "",
    rate: job.rate,
    high_rate: job.highRate,
    medium_rate: job.mediumRate,
    low_rate: job.lowRate,
    locale: job.locale, // This is a direct string from Locale type
    locale_id: job.localeId, // This should be the UUID from locales table
    owner: job.owner,
    owner_id: job.ownerId,
    date: job.date,
    work_details: job.workDetails || "",
    pay_details: job.payDetails || "",
    other: job.other || "",
    video_questions: job.videoQuestions || "",
    screening_questions: job.screeningQuestions || "",
    flavor: job.flavor,
    flavor_id: job.flavorId,
    m1: job.m1 || "",
    m2: job.m2 || "",
    m3: job.m3 || "",
  };
};

/**
 * Map database job to Job object
 */
export const mapDatabaseToJob = (dbJob: any): Job => {
  return {
    id: dbJob.id,
    internalTitle: dbJob.internal_title,
    candidateFacingTitle: dbJob.candidate_facing_title, // Convert snake_case to camelCase
    jd: dbJob.jd,
    status: dbJob.status, // Direct string mapping
    statusId: dbJob.status_id, // UUID of the status
    m1: dbJob.m1,
    m2: dbJob.m2,
    m3: dbJob.m3,
    skillsSought: dbJob.skills_sought,
    minSkills: dbJob.min_skills,
    linkedinSearch: dbJob.linkedin_search, // Map the linkedinSearch field
    lir: dbJob.lir,
    client: dbJob.client,
    clientId: dbJob.client_id,
    compDesc: dbJob.comp_desc,
    rate: Number(dbJob.rate),
    highRate: Number(dbJob.high_rate),
    mediumRate: Number(dbJob.medium_rate),
    lowRate: Number(dbJob.low_rate),
    locale: dbJob.locale, // Direct string mapping
    localeId: dbJob.locale_id, // UUID of the locale
    owner: dbJob.owner,
    ownerId: dbJob.owner_id,
    date: dbJob.date,
    workDetails: dbJob.work_details,
    payDetails: dbJob.pay_details,
    other: dbJob.other || "",
    videoQuestions: dbJob.video_questions,
    screeningQuestions: dbJob.screening_questions,
    flavor: dbJob.flavor,
    flavorId: dbJob.flavor_id,
  };
};
