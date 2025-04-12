
import { useState, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, EmailThreadInfo } from "@/components/candidates/types";
import { CandidateState } from "./types";
import { Json } from "@/integrations/supabase/types";

export function useLoadCandidates(
  candidates: CandidateState,
  setCandidates: (candidates: CandidateState) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingJobsRef = useRef<Record<string, boolean>>({});
  
  // Load candidates for a specific job
  const loadCandidatesForJob = useCallback(async (jobId: string) => {
    // Prevent multiple simultaneous loads for the same job
    if (loadingJobsRef.current[jobId]) {
      console.log(`Already loading candidates for job ${jobId}`);
      return;
    }
    
    // Check if we already have candidates for this job
    if (candidates[jobId] && candidates[jobId].length > 0) {
      console.log(`Using cached candidates for job ${jobId}`);
      return;
    }
    
    setIsLoading(true);
    loadingJobsRef.current[jobId] = true;
    
    try {
      console.log(`Loading candidates for job ${jobId}`);
      
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
        return;
      }
      
      // Map candidates with their application status
      const mappedCandidates = candidatesData.map(candidate => {
        const application = applications.find(app => app.candidate_id === candidate.id);
        
        // Safely parse thread_ids from JSON
        let threadIds: Record<string, EmailThreadInfo> = {};
        try {
          // Check if thread_ids is a string and needs parsing
          if (typeof candidate.thread_ids === 'string') {
            threadIds = JSON.parse(candidate.thread_ids || '{}');
          } else if (candidate.thread_ids && typeof candidate.thread_ids === 'object') {
            // Already an object, make a safe copy
            const rawThreadIds = { ...candidate.thread_ids as Record<string, any> };
            
            // Convert each entry to the standardized EmailThreadInfo format
            Object.entries(rawThreadIds).forEach(([key, value]) => {
              if (typeof value === 'string') {
                // Legacy format: string -> { threadId, messageId }
                threadIds[key] = { threadId: value, messageId: value };
              } else if (value && typeof value === 'object') {
                // Object format: ensure it has both threadId and messageId
                const threadInfo = value as Partial<EmailThreadInfo>;
                threadIds[key] = {
                  threadId: threadInfo.threadId || '',
                  messageId: threadInfo.messageId || threadInfo.threadId || ''
                };
              } else {
                // Handle null or undefined
                threadIds[key] = { threadId: '', messageId: '' };
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing thread_ids for candidate ${candidate.id}:`, error);
          threadIds = {};
        }
        
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
      
      console.log(`Loaded ${mappedCandidates.length} candidates for job ${jobId}`);
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
      // Clear loading flag after a short delay to prevent rapid re-fetching
      setTimeout(() => {
        loadingJobsRef.current[jobId] = false;
      }, 1000);
    }
  }, [candidates, setCandidates]);

  return { loadCandidatesForJob, isLoading };
}
