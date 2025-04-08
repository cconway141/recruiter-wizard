
import { Job } from "./job";
import { Candidate } from "@/components/candidates/types";
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
  
  // Candidate operations
  addCandidate: (jobId: string, candidate: Omit<Candidate, 'id' | 'status' | 'applicationId'>) => Promise<void>;
  removeCandidate: (jobId: string, candidateId: string) => Promise<void>;
  updateCandidateStatus: (jobId: string, candidateId: string, status: keyof Candidate['status']) => Promise<void>;
  getCandidates: (jobId: string) => Candidate[];
  loadCandidatesForJob: (jobId: string) => Promise<void>;
  candidatesLoading: boolean;
  
  isAirtableEnabled: boolean;
  loadFromSupabase: () => Promise<void>;
}
