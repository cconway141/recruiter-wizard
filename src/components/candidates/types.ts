
export type CandidateStatus = {
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interviewing: boolean;
  offered: boolean;
};

export type Candidate = {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  status: CandidateStatus;
  applicationId?: string;
  threadIds?: Record<string, string>; // Store thread IDs for each job
};
