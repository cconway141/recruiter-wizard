
import { JobFormDescription } from "./job-details/JobFormDescription";
import { JobFormWorkDetails } from "./job-details/JobFormWorkDetails";
import { JobFormQuestionDetails } from "./job-details/JobFormQuestionDetails";
import { JobFormOtherInfo } from "./job-details/JobFormOtherInfo";
import { UseFormReturn } from "react-hook-form";

export interface JobFormValues {
  candidateFacingTitle: string;
  compDesc: string;
  locale: { id: string; name: string };
  flavor: { id: string; name: string };
  status: { id: string; name: string };
  skillsSought: string;
  videoQuestions: string;
  workDetails: string;
  payDetails: string;
  jd: string;
  minSkills: string;
  other: string;
  screeningQuestions: string;
  m1: string;
  m2: string;
  m3: string;
  owner: string;
  client: string;
  rate: number;
  previewName?: string;
  [key: string]: any;
}

// We don't actually need this interface as we're not passing the form down
export function JobFormDetails() {
  return (
    <div className="space-y-6">
      <JobFormDescription />
      <JobFormWorkDetails />
      <JobFormQuestionDetails />
      <JobFormOtherInfo />
    </div>
  );
}
