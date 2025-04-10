
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useJobs } from "@/contexts/JobContext";
import { CandidateEntry } from "@/components/candidates/CandidateEntry";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobDetails } from "@/components/jobs/JobDetails";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { JobMessages } from "@/components/jobs/JobMessages";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertCircle, X } from "lucide-react";

const ViewJob = () => {
  const { id } = useParams<{ id: string }>();
  const { getJob, loadCandidatesForJob } = useJobs();
  const navigate = useNavigate();
  const job = id ? getJob(id) : undefined;
  const hasLoadedCandidates = useRef(false);
  const { isGmailConnected, isCheckingGmail } = useGmailAuth();
  const [showGmailAlert, setShowGmailAlert] = useState(true);

  useEffect(() => {
    if (id && !job) {
      // Job not found, redirect to dashboard
      navigate("/");
    } else if (id && !hasLoadedCandidates.current) {
      // Load candidates for this job only once
      loadCandidatesForJob(id);
      hasLoadedCandidates.current = true;
    }
  }, [id, job, navigate, loadCandidatesForJob]);

  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        {!isGmailConnected && !isCheckingGmail && showGmailAlert && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="flex-1">
              <AlertTitle className="text-amber-800">Gmail Not Connected</AlertTitle>
              <AlertDescription className="text-amber-700">
                To send emails to candidates, you need to connect your Gmail account.
              </AlertDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Gmail
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-700"
                onClick={() => setShowGmailAlert(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}
        
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
