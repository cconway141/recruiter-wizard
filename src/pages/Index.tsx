
import { PageHeader } from "@/components/layout/PageHeader";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Navbar } from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Job Dashboard" 
          description="Manage and track recruiter jobs in one place. Create personalized messages for LinkedIn outreach."
        />
        <JobsFilter />
        <JobsTable />
      </main>
    </div>
  );
};

export default Index;
