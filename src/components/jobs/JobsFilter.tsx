
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobStatus, Locale } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";

export function JobsFilter() {
  const { setFilters } = useJobs();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const [locale, setLocale] = useState<Locale | "All">("All");

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters({ search, status, locale });
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, status, locale, setFilters]);

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by title, client or owner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as JobStatus | "All")}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Aquarium">Aquarium</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="locale">Locale</Label>
        <Select
          value={locale}
          onValueChange={(value) => setLocale(value as Locale | "All")}
        >
          <SelectTrigger id="locale">
            <SelectValue placeholder="Select locale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Locales</SelectItem>
            <SelectItem value="Onshore">Onshore</SelectItem>
            <SelectItem value="Nearshore">Nearshore</SelectItem>
            <SelectItem value="Offshore">Offshore</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
