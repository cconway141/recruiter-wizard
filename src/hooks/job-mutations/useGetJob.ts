
import { Job } from "@/types/job";

export function useGetJob(jobs: Job[]) {
  const getJob = (id: string) => {
    return jobs.find((job) => job.id === id);
  };

  return getJob;
}
