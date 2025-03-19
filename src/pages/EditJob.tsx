
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const { getJob } = useJobs();
  const navigate = useNavigate();
  const job = id ? getJob(id) : undefined;

  useEffect(() => {
    if (id && !job) {
      // Job not found, redirect to dashboard
      navigate("/");
    }
  }, [id, job, navigate]);

  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <PageHeader 
            title={`Edit Job: ${job.internalTitle}`} 
            description="Update job details and message templates."
          />
        </div>
        <JobForm job={job} isEditing />
      </main>
    </div>
  );
};

export default EditJob;
