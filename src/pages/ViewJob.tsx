
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useJobs } from "@/contexts/JobContext";
import { CandidateEntry } from "@/components/candidates/CandidateEntry";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobDetails } from "@/components/jobs/JobDetails";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { JobMessages } from "@/components/jobs/JobMessages";

const ViewJob = () => {
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
        <JobHeader job={job} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <JobDetails job={job} />
          <JobSidebar job={job} />
        </div>
        
        {/* Candidate Entry Component */}
        {id && <CandidateEntry jobId={id} />}
        
        <JobMessages job={job} />
      </main>
    </div>
  );
};

export default ViewJob;
