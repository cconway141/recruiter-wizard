
import { Job } from "@/types/job";
import { useAddJob } from "./job-mutations/useAddJob";
import { useUpdateJob } from "./job-mutations/useUpdateJob";
import { useDeleteJob } from "./job-mutations/useDeleteJob";
import { useGetJob } from "./job-mutations/useGetJob";

export function useJobMutations(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const addJob = useAddJob(jobs, setJobs);
  const updateJob = useUpdateJob(jobs, setJobs);
  const deleteJob = useDeleteJob(jobs, setJobs);
  const getJob = useGetJob(jobs);

  return { addJob, updateJob, deleteJob, getJob };
}
