
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/components/candidates/types";
import { CandidateState } from "./types";

export function useAddCandidate(
  candidates: CandidateState,
  setCandidates: (candidates: CandidateState) => void
) {
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

  return { addCandidate };
}
