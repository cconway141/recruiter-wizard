
import { useState, useEffect, useMemo } from "react";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";

export interface JobFilters {
  search: string;
  status: JobStatus | "All";
  locale: Locale | "All";
  flavor: Flavor | "All" | string;
}

export function useJobFilters(jobs: Job[]) {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFiltersState] = useState<JobFilters>({
    search: "",
    status: "All",
    locale: "All",
    flavor: "All"
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

    // Apply flavor filter
    if (filters.flavor !== "All") {
      result = result.filter((job) => job.flavor === filters.flavor);
    }

    return result;
  }, [jobs, filters]);

  // Update filtered jobs when filters or jobs change
  useEffect(() => {
    setFilteredJobs(applyFilters);
  }, [applyFilters]);

  const setFilters = (newFilters: Partial<JobFilters>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return { filteredJobs, filters, setFilters };
}
