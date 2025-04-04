
import { PageHeader } from "@/components/layout/PageHeader";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Navbar } from "@/components/layout/Navbar";
import { useJobs } from "@/contexts/JobContext";

const Index = () => {
  const { isAirtableEnabled } = useJobs();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <PageHeader 
            title="Job Dashboard" 
            description="Manage and track recruiter jobs in one place. Create personalized messages for LinkedIn outreach."
          />
        </div>
        <JobsFilter />
        <JobsTable />
      </main>
    </div>
  );
};

export default Index;
