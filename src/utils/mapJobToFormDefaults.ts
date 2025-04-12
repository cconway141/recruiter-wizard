
import { Job } from "@/types/job";
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
      flavor: {
        id: '',
        name: ''
      },
      status: {
        id: '',
        name: ''
      },
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
  
  return {
    candidateFacingTitle: job.candidateFacingTitle,
    client: job.client,
    compDesc: job.compDesc,
    locale: job.locale,
    flavor: {
      id: job.flavor,
      name: job.flavor
    },
    status: {
      id: job.status,
      name: job.status
    },
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
