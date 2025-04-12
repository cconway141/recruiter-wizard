
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useJobData } from "./hooks/useJobData";
import { JobLoadingState } from "./components/JobLoadingState";
import { JobErrorState } from "./components/JobErrorState";

const EditJobPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job, form, isLoading, isFetching, error } = useJobData(id);

  // Show error state if we failed to load the job
  if (error) {
    return <JobErrorState error={error} navigate={navigate} />;
  }

  // Show loading state
  if (isLoading || isFetching || (!job && id)) {
    return <JobLoadingState navigate={navigate} />;
  }

  // If no job found even after fetch attempts, redirect to dashboard
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
        <Form {...form}>
          {isLoading ? (
            <JobLoadingState navigate={navigate} showHeaderAndNav={false} />
          ) : (
            <JobForm job={job} isEditing />
          )}
        </Form>
      </main>
    </div>
  );
};

export default EditJobPage;
