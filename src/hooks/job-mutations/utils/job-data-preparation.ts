
import { uuid } from "@/utils/uuid";
import { Job, LocaleObject, StatusObject, FlavorObject } from "@/types/job";
import { calculateRates } from "@/utils/rateUtils";
import { generateInternalTitle } from "@/utils/titleUtils";
import { supabase } from "@/integrations/supabase/client";

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

  // Ensure flavor is a valid object
  let flavor: FlavorObject;
  if (typeof job.flavor === 'string') {
    // Handle case when flavor is passed as a string (legacy format)
    flavor = {
      id: job.flavor,
      name: job.flavor
    };
  } else {
    // It's already an object
    flavor = job.flavor as FlavorObject;
  }

  // Generate the internal title using the correct format: ClientAbbr RoleAbbr - Flavor LocaleAbbr
  const internalTitle = await generateInternalTitle(
    job.client,
    job.candidateFacingTitle,
    flavor, // Pass the standardized flavor object
    job.locale
  );
  
  // Calculate rates based on the main rate using our utility function
  const rate = Number(job.rate) || 0;
  const { high: highRate, medium: mediumRate, low: lowRate = 0 } = calculateRates(rate);

  // Ensure status is a valid object with proper statusId
  let status = job.status;
  let statusId = typeof job.status === 'object' ? job.status.id : null;

  // If no status ID is provided or it's an empty string, fetch a valid one from the database
  if (!statusId || statusId.trim() === '') {
    try {
      // Try to fetch a valid status ID for the status name
      const statusName = typeof job.status === 'object' ? job.status.name : 'Active';
      const { data: statusData } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('name', statusName)
        .maybeSingle();
      
      if (statusData?.id) {
        console.log(`Found existing status ID for "${statusName}": ${statusData.id}`);
        statusId = statusData.id;
      } else {
        // If status not found in database, use locally generated UUID as fallback
        statusId = uuid();
        console.log(`No status found for "${statusName}", generated fallback UUID: ${statusId}`);
      }
    } catch (error) {
      console.error("Error fetching status ID:", error);
      statusId = uuid();
      console.log("Generated fallback UUID for status due to error:", statusId);
    }
  }

  // Ensure we have a proper status object
  status = {
    id: statusId,
    name: typeof job.status === 'object' ? job.status.name : (job.status || 'Active')
  };

  return {
    ...job,
    id: uuid(),
    status, // Use standardized status object with valid UUID
    statusId, // Include the status ID explicitly
    flavor, // Use standardized flavor object
    flavorId: flavor.id, // Include the flavor ID explicitly
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
  // Ensure job.status is an object
  const jobStatus = job.status || { id: '', name: 'Active' };
  
  // Extract status name and ID for database, ensure ID is never empty string
  const statusName = jobStatus.name;
  const statusId = jobStatus.id || null; // Convert empty string to null
  
  // Ensure flavor is properly handled as object or string
  const flavorId = typeof job.flavor === 'object' ? job.flavor.id : job.flavor;
  const flavorName = typeof job.flavor === 'object' ? job.flavor.name : job.flavor;
  
  // Clean foreign key references - null is better than empty string for UUID fields
  const cleanForeignKey = (id: string | undefined | null) => 
    (id && id.trim() !== '') ? id : null;
  
  return {
    id: job.id,
    internal_title: job.internalTitle,
    candidate_facing_title: job.candidateFacingTitle,
    jd: job.jd || "",
    status: statusName,
    status_id: statusId,
    skills_sought: job.skillsSought || "",
    min_skills: job.minSkills || "",
    linkedin_search: job.linkedinSearch || "",
    lir: job.lir || "",
    client: job.client,
    client_id: cleanForeignKey(job.clientId),
    comp_desc: job.compDesc || "",
    rate: job.rate,
    high_rate: job.highRate,
    medium_rate: job.mediumRate,
    low_rate: job.lowRate,
    locale: job.locale.id,
    locale_id: cleanForeignKey(job.localeId),
    owner: job.owner,
    owner_id: cleanForeignKey(job.ownerId),
    date: job.date,
    work_details: job.locale.workDetails || job.workDetails || "",
    pay_details: job.locale.payDetails || job.payDetails || "",
    other: job.other || "",
    video_questions: job.videoQuestions || "",
    screening_questions: job.screeningQuestions || "",
    flavor: flavorName, // Store flavor name for backward compatibility
    flavor_id: cleanForeignKey(flavorId),
    m1: job.m1 || "",
    m2: job.m2 || "",
    m3: job.m3 || "",
  };
};

/**
 * Map database job to Job object
 */
export const mapDatabaseToJob = (dbJob: any): Job => {
  // Create a properly structured locale object
  const localeObject: LocaleObject = {
    id: dbJob.locale || '',
    name: dbJob.locale || '',
    abbreviation: dbJob.locale_abbreviation || '',
    workDetails: dbJob.work_details || '',
    payDetails: dbJob.pay_details || ''
  };

  // Create standardized status object
  const statusObject: StatusObject = {
    id: dbJob.status_id || '',
    name: dbJob.status || 'Active'
  };

  // Create standardized flavor object
  const flavorObject: FlavorObject = {
    id: dbJob.flavor_id || dbJob.flavor || '',
    name: dbJob.flavor || ''
  };

  return {
    id: dbJob.id,
    internalTitle: dbJob.internal_title,
    candidateFacingTitle: dbJob.candidate_facing_title,
    jd: dbJob.jd,
    status: statusObject, // Use the standardized status object
    statusId: dbJob.status_id,
    m1: dbJob.m1,
    m2: dbJob.m2,
    m3: dbJob.m3,
    skillsSought: dbJob.skills_sought,
    minSkills: dbJob.min_skills,
    linkedinSearch: dbJob.linkedin_search,
    lir: dbJob.lir,
    client: dbJob.client,
    clientId: dbJob.client_id,
    compDesc: dbJob.comp_desc,
    rate: Number(dbJob.rate),
    highRate: Number(dbJob.high_rate),
    mediumRate: Number(dbJob.medium_rate),
    lowRate: Number(dbJob.low_rate),
    locale: localeObject,
    localeId: dbJob.locale_id,
    owner: dbJob.owner,
    ownerId: dbJob.owner_id,
    date: dbJob.date,
    workDetails: dbJob.work_details,
    payDetails: dbJob.pay_details,
    other: dbJob.other || "",
    videoQuestions: dbJob.video_questions,
    screeningQuestions: dbJob.screening_questions,
    flavor: flavorObject, // Always return a flavor object
    flavorId: dbJob.flavor_id,
  };
};
