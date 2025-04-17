
import React from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Job Details" 
          description={`Viewing details for job ID: ${id}`}
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <p>Job details will appear here</p>
        </div>
      </main>
    </div>
  );
};

export default JobDetails;
