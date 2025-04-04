
import { Job, JobStatus, Locale } from "@/types/job";
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";

export interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  filteredJobs: Job[];
  setFilters: (filters: { search: string; status: JobStatus | "All"; locale: Locale | "All" }) => void;
  addCandidate: (jobId: string, name: string) => void;
  removeCandidate: (jobId: string, candidateId: string) => void;
  updateCandidateStatus: (jobId: string, candidateId: string, statusKey: keyof CandidateStatus, value: boolean) => void;
  getCandidates: (jobId: string) => Candidate[];
  isAirtableEnabled: boolean;
}

export interface JobsState {
  jobs: Job[];
  candidates: Record<string, Candidate[]>; // jobId -> candidates[]
}

export interface JobFilters {
  search: string;
  status: JobStatus | "All";
  locale: Locale | "All";
}
