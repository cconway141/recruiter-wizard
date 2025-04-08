
import { toast } from "@/components/ui/use-toast";
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Define types for our application data
type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  pending_approval: boolean;
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interview_request: boolean;
  interview_failed: boolean;
  offer: boolean;
  placed: boolean;
  hold: boolean;
};

export function useCandidateOperations(
  candidates: Record<string, Candidate[]>, 
  setCandidates: (candidates: Record<string, Candidate[]>) => void
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
        .select('*')
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
        
        return {
          id: candidate.id,
          name: `${candidate.first_name} ${candidate.last_name}`,
          email: candidate.email,
          linkedinUrl: candidate.linkedin_url,
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
  
  // Add a new candidate to a job
  const addCandidate = async (jobId: string, candidateData: Omit<Candidate, 'id' | 'status' | 'applicationId'>) => {
    try {
      // Extract candidate basic info
      const [firstName, ...lastNameParts] = candidateData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      // First, create the candidate
      const { data: newCandidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          first_name: firstName,
          last_name: lastName || '',
          email: candidateData.email || '',
          linkedin_url: candidateData.linkedinUrl || null
        })
        .select()
        .single();
        
      if (candidateError) throw candidateError;
      
      if (!newCandidate) {
        throw new Error("Failed to create candidate");
      }
      
      // Then create the application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          candidate_id: newCandidate.id,
          status: 'pending_approval'
        })
        .select()
        .single();
        
      if (applicationError) throw applicationError;
      
      // Add to local state
      const newCandidateObject: Candidate = {
        id: newCandidate.id,
        name: `${newCandidate.first_name} ${newCandidate.last_name}`,
        email: newCandidate.email,
        linkedinUrl: newCandidate.linkedin_url,
        status: {
          approved: false,
          preparing: false,
          submitted: false,
          interviewing: false,
          offered: false,
        },
        applicationId: application.id,
      };
      
      const updatedCandidates = { 
        ...candidates,
        [jobId]: [...(candidates[jobId] || []), newCandidateObject]
      };
      
      setCandidates(updatedCandidates);
      
      toast({
        title: "Candidate Added",
        description: "The candidate has been added successfully.",
      });
      
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error Adding Candidate",
        description: "Failed to add candidate. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove a candidate from a job
  const removeCandidate = async (jobId: string, candidateId: string) => {
    try {
      // Find the candidate to get the application id
      const candidate = candidates[jobId]?.find(c => c.id === candidateId);
      
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      
      // Remove the application (not the candidate)
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId);
        
      if (error) throw error;
      
      // Update local state
      const updatedJobCandidates = candidates[jobId].filter(
        candidate => candidate.id !== candidateId
      );
      
      setCandidates({
        ...candidates,
        [jobId]: updatedJobCandidates
      });
      
      toast({
        title: "Candidate Removed",
        description: "The candidate has been removed from this job.",
      });
      
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast({
        title: "Error Removing Candidate",
        description: "Failed to remove candidate. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update candidate status
  const updateCandidateStatus = async (
    jobId: string, 
    candidateId: string, 
    statusKey: keyof CandidateStatus
  ) => {
    try {
      const candidate = candidates[jobId]?.find(c => c.id === candidateId);
      
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      
      // Map the status key to the database column
      const dbStatusMap: Record<keyof CandidateStatus, string> = {
        approved: 'approved',
        preparing: 'preparing',
        submitted: 'submitted',
        interviewing: 'interview_request',
        offered: 'offer'
      };
      
      const dbColumn = dbStatusMap[statusKey];
      
      // Get current status
      const currentValue = candidate.status[statusKey];
      
      // Update the status in the database
      const { error } = await supabase
        .from('applications')
        .update({
          [dbColumn]: !currentValue,
          status: !currentValue ? statusKey : 'pending_approval' // Update the main status field
        })
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId);
        
      if (error) throw error;
      
      // Update local state
      const updatedCandidates = candidates[jobId].map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: {
              ...c.status,
              [statusKey]: !c.status[statusKey]
            }
          };
        }
        return c;
      });
      
      setCandidates({
        ...candidates,
        [jobId]: updatedCandidates
      });
      
      toast({
        title: "Status Updated",
        description: `Candidate status has been ${!currentValue ? 'set to' : 'removed from'} ${statusKey}.`,
      });
      
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast({
        title: "Error Updating Status",
        description: "Failed to update candidate status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCandidates = (jobId: string): Candidate[] => {
    return candidates[jobId] || [];
  };

  return { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    isLoading
  };
}
