
import { Job, LocaleObject, FlavorObject, StatusObject } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";

/**
 * Maps a Job object to the correct format for JobFormValues
 * This ensures all fields match the expected types for the form
 */
export const mapJobToFormDefaults = (job: Job): JobFormValues => {
  if (!job) {
    return {
      candidateFacingTitle: '',
      client: '',
      compDesc: '',
      locale: {
        id: '',
        name: ''
      },
      flavor: '',
      status: '',
      rate: 0,
      jd: '',
      skillsSought: '',
      minSkills: '',
      owner: '',
      videoQuestions: '',
      screeningQuestions: '',
      workDetails: '',
      payDetails: '',
      other: '',
      m1: '',
      m2: '',
      m3: '',
    };
  }
  
  // Ensure locale has the right structure
  const locale: LocaleObject = {
    id: job.locale.id,
    name: job.locale.name || '',
    abbreviation: job.locale.abbreviation || '',
    workDetails: job.locale.workDetails || '',
    payDetails: job.locale.payDetails || ''
  };
  
  return {
    candidateFacingTitle: job.candidateFacingTitle,
    client: job.client,
    compDesc: job.compDesc,
    locale: locale,
    flavor: job.flavor,
    status: job.status,
    rate: job.rate,
    jd: job.jd,
    skillsSought: job.skillsSought,
    minSkills: job.minSkills,
    owner: job.owner,
    videoQuestions: job.videoQuestions,
    screeningQuestions: job.screeningQuestions,
    workDetails: job.workDetails,
    payDetails: job.payDetails,
    other: job.other,
    m1: job.m1,
    m2: job.m2,
    m3: job.m3,
  };
};
