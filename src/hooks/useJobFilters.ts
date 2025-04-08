
import { useState, useEffect, useMemo } from "react";
import { Job, JobStatus, Locale } from "@/types/job";
import { JobFilters } from "@/types/contextTypes";

export function useJobFilters(jobs: Job[]) {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFiltersState] = useState<JobFilters>({
    search: "",
    status: "All",
    locale: "All"
  });

  // Apply filters effect
  const applyFilters = useMemo(() => {
    let result = [...jobs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (job) =>
          job.internalTitle.toLowerCase().includes(searchLower) ||
          job.candidateFacingTitle.toLowerCase().includes(searchLower) ||
          job.client.toLowerCase().includes(searchLower) ||
          job.owner.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== "All") {
      result = result.filter((job) => job.status === filters.status);
    }

    // Apply locale filter
    if (filters.locale !== "All") {
      result = result.filter((job) => job.locale === filters.locale);
    }

    return result;
  }, [jobs, filters]);

  // Update filtered jobs when filters or jobs change
  useEffect(() => {
    setFilteredJobs(applyFilters);
  }, [applyFilters]);

  const setFilters = (newFilters: JobFilters) => {
    setFiltersState(newFilters);
  };

  return { filteredJobs, setFilters };
}
