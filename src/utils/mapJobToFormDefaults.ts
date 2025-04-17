import { Job, StatusObject, FlavorObject, LocaleObject } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";

export const mapJobToFormDefaults = (job: Job): JobFormValues => {
  if (!job) {
    return {
      candidateFacingTitle: '',
      client: '',
      compDesc: '',
      locale: {
        id: '',
        name: '',
      },
      flavor: {
        id: '',
        name: ''
      },
      status: {
        id: '',
        name: 'Active'
      },
      rate: 0,
      jd: '',
      skillsSought: '',
      minSkills: '',
      owner: '',
      videoQuestions: '',
      screeningQuestions: '',
      workDetails: job.workDetails || '',  // Add this line
      payDetails: job.payDetails || '',    // Add this line
      other: '',
      m1: '',
      m2: '',
      m3: '',
    };
  }
  
  // Ensure locale is an object with required properties
  const locale: { id: string; name: string } = typeof job.locale === 'object' && job.locale !== null
    ? { 
        id: job.locale.id || '', 
        name: job.locale.name || '',
      }
    : { 
        id: job.localeId || '', 
        name: typeof job.locale === 'string' ? job.locale : '',
      };
  
  // Ensure flavor is an object with id and name properties
  const flavor: FlavorObject = typeof job.flavor === 'object' && job.flavor !== null
    ? job.flavor
    : { id: job.flavorId || (typeof job.flavor === 'string' ? job.flavor : ''), name: typeof job.flavor === 'string' ? job.flavor : '' };
  
  // Ensure status is an object
  const status: StatusObject = typeof job.status === 'object' && job.status !== null
    ? job.status
    : { id: job.statusId || '', name: typeof job.status === 'string' ? job.status : 'Active' };
  
  const existingMapping = {
    candidateFacingTitle: job.candidateFacingTitle || '',
    client: job.client || '',
    compDesc: job.compDesc || '',
    locale: locale,
    flavor: flavor,
    status: status,
    rate: typeof job.rate === 'number' ? job.rate : 0,
    jd: job.jd || '',
    skillsSought: job.skillsSought || '',
    minSkills: job.minSkills || '',
    owner: job.owner || '',
    videoQuestions: job.videoQuestions || '',
    screeningQuestions: job.screeningQuestions || '',
    other: job.other || '',
    m1: job.m1 || '',
    m2: job.m2 || '',
    m3: job.m3 || '',
  };
  return {
    ...existingMapping,
    workDetails: job.workDetails || '',
    payDetails: job.payDetails || '',
  };
};
