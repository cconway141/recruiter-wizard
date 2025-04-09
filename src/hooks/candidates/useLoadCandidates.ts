
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/components/candidates/types";
import { CandidateState } from "./types";

export function useLoadCandidates(
  candidates: CandidateState,
  setCandidates: (candidates: CandidateState) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Load candidates for a specific job
  const loadCandidatesForJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      // Get all applications for this job
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          pending_approval,
          approved,
          preparing,
          submitted,
          interview_request,
          interview_failed,
          offer,
          placed,
          hold
        `)
        .eq('job_id', jobId);
        
      if (applicationsError) throw applicationsError;
      
      if (!applications || applications.length === 0) {
        setCandidates({...candidates, [jobId]: []});
        setIsLoading(false);
        return;
      }
      
      // Get all candidate details for these applications
      const candidateIds = applications.map(app => app.candidate_id);
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*, thread_ids')  // Explicitly select thread_ids
        .in('id', candidateIds);
        
      if (candidatesError) throw candidatesError;
      
      if (!candidatesData) {
        setCandidates({...candidates, [jobId]: []});
        setIsLoading(false);
        return;
      }
      
      // Map candidates with their application status
      const mappedCandidates = candidatesData.map(candidate => {
        const application = applications.find(app => app.candidate_id === candidate.id);
        
        // Access thread_ids from the candidate data
        const threadIds = candidate.thread_ids || {};
        
        return {
          id: candidate.id,
          name: `${candidate.first_name} ${candidate.last_name}`,
          email: candidate.email,
          linkedinUrl: candidate.linkedin_url,
          threadIds: threadIds,
          status: {
            approved: application?.approved || false,
            preparing: application?.preparing || false,
            submitted: application?.submitted || false,
            interviewing: application?.interview_request || false,
            offered: application?.offer || false,
          },
          applicationId: application?.id,
        } as Candidate;
      });
      
      setCandidates({...candidates, [jobId]: mappedCandidates});
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast({
        title: "Error Loading Candidates",
        description: "Failed to load candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { loadCandidatesForJob, isLoading };
}
