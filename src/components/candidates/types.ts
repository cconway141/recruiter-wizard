
export type CandidateStatus = {
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interviewing: boolean;
  offered: boolean;
};

// Define the standard thread info structure
export interface EmailThreadInfo {
  threadId: string;  // always required
  messageId: string; // always required (can be "" if unknown)
}

export type Candidate = {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  status: CandidateStatus;
  applicationId?: string;
  threadIds?: Record<string, EmailThreadInfo>; // Only use the standardized format
};
