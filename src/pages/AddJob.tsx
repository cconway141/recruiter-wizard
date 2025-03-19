
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";

const AddJob = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Add New Job" 
          description="Create a new job posting with automated message templates."
        />
        <JobForm />
      </main>
    </div>
  );
};

export default AddJob;
