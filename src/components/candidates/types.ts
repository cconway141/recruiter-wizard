
export type CandidateStatus = {
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interviewing: boolean;
  offered: boolean;
};

// Define the thread info structure
export interface ThreadInfo {
  threadId: string;
  messageId: string;
}

export type Candidate = {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  status: CandidateStatus;
  applicationId?: string;
  threadIds?: Record<string, ThreadInfo | string>; // Support both new and legacy formats
};
