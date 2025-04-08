import { Job, Locale } from "@/types/job";
import { lookupEntityByName } from "./job-db-operations";
import { calculateRates } from "@/utils/rateUtils";
import { generateInternalTitle } from "@/utils/titleUtils";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";

/**
 * Prepares a job for database insertion by gathering all required data
 * @param jobData Basic job data provided from the form
 * @returns Fully prepared job data ready for database insertion
 */
export async function prepareJobForInsertion(
  jobData: Omit<Job, "id">
) {
  // Generate the internal title if not provided
  const internalTitle = jobData.internalTitle || generateInternalTitle(
    jobData.client, 
    jobData.candidateFacingTitle, 
    jobData.flavor, 
    jobData.locale
  );
  
  // Calculate rates
  const { high, medium, low } = calculateRates(jobData.rate);
  
  // Get locale-specific details
  const workDetails = await getWorkDetails(jobData.locale);
  const payDetails = await getPayDetails(jobData.locale);
  
  // Generate message templates
  const m1 = await generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
  const m2 = await generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
  const m3 = await generateM3(jobData.videoQuestions);

  // Look up all the necessary foreign keys
  const clientId = await lookupEntityByName('clients', 'name', jobData.client);
  const localeId = await lookupEntityByName('locales', 'name', jobData.locale);
  const flavorId = await lookupEntityByName('flavors', 'name', jobData.flavor);
  const statusId = await lookupEntityByName('job_statuses', 'name', jobData.status);
  const ownerData = null; // Not looking up real users anymore

  // Prepare the database entry
  return {
    internal_title: internalTitle,
    candidate_facing_title: jobData.candidateFacingTitle,
    jd: jobData.jd,
    status: jobData.status,
    skills_sought: jobData.skillsSought,
    min_skills: jobData.minSkills,
    lir: jobData.lir,
    client: jobData.client,
    client_id: clientId,
    comp_desc: jobData.compDesc,
    rate: jobData.rate,
    high_rate: high,
    medium_rate: medium,
    low_rate: low,
    locale: jobData.locale,
    locale_id: localeId,
    owner: jobData.owner,
    owner_id: ownerData,
    date: jobData.date,
    work_details: workDetails,
    pay_details: payDetails,
    other: jobData.other,
    video_questions: jobData.videoQuestions,
    screening_questions: jobData.screeningQuestions,
    flavor: jobData.flavor,
    flavor_id: flavorId,
    status_id: statusId,
    m1,
    m2,
    m3,
    linkedin_search: '' // Required by database schema
  };
}

/**
 * Transforms the raw database job data to match our Job interface
 * @param data The raw database job data
 * @param internalTitle The generated internal title
 * @param high The high rate
 * @param medium The medium rate
 * @param low The low rate
 * @param workDetails The work details
 * @param payDetails The pay details
 * @param m1 The first message template
 * @param m2 The second message template
 * @param m3 The third message template
 * @returns A job object matching our Job interface
 */
export function transformDatabaseJobToJobObject(
  data: any,
  internalTitle: string,
  high: number,
  medium: number,
  low: number,
  workDetails: string,
  payDetails: string,
  m1: string,
  m2: string,
  m3: string
): Job {
  return {
    id: data.id,
    internalTitle: data.internal_title || internalTitle,
    candidateFacingTitle: data.candidate_facing_title,
    jd: data.jd,
    status: data.status,
    skillsSought: data.skills_sought,
    minSkills: data.min_skills,
    lir: data.lir,
    client: data.client,
    clientId: data.client_id,
    compDesc: data.comp_desc,
    rate: data.rate,
    highRate: data.high_rate || high,
    mediumRate: data.medium_rate || medium,
    lowRate: data.low_rate || low,
    locale: data.locale,
    localeId: data.locale_id,
    owner: data.owner,
    ownerId: data.owner_id,
    date: data.date,
    workDetails: data.work_details || workDetails,
    payDetails: data.pay_details || payDetails,
    other: data.other || "",
    videoQuestions: data.video_questions,
    screeningQuestions: data.screening_questions,
    flavor: data.flavor,
    flavorId: data.flavor_id,
    statusId: data.status_id,
    m1: data.m1 || m1,
    m2: data.m2 || m2,
    m3: data.m3 || m3
  };
}
