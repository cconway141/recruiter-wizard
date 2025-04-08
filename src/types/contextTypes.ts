
import { Job } from "./job";
import { Candidate } from "@/components/candidates/CandidateEntry";
import { JobFilters } from "@/hooks/useJobFilters";

export interface JobsState {
  jobs: Job[];
  candidates: Record<string, Candidate[]>;
}

export interface JobContextType {
  jobs: Job[];
  filteredJobs: Job[];
  filters: JobFilters;
  setFilters: (filters: Partial<JobFilters>) => void;
  addJob: (job: any) => Promise<Job | null>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  addCandidate: (jobId: string, candidate: Candidate) => void;
  removeCandidate: (jobId: string, candidateId: string) => void;
  updateCandidateStatus: (jobId: string, candidateId: string, status: string) => void;
  getCandidates: (jobId: string) => Candidate[];
  isAirtableEnabled: boolean;
  loadFromSupabase: () => Promise<void>;
}
