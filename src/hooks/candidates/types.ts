
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";

// Database application type
export type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  pending_approval: boolean;
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interview_request: boolean;
  interview_failed: boolean;
  offer: boolean;
  placed: boolean;
  hold: boolean;
};

// Status mapping for database columns
export const dbStatusMap: Record<keyof CandidateStatus, string> = {
  approved: 'approved',
  preparing: 'preparing',
  submitted: 'submitted',
  interviewing: 'interview_request',
  offered: 'offer'
};

export type CandidateState = Record<string, Candidate[]>;
