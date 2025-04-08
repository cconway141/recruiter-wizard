
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Plus, Trash, User, Linkedin, Mail } from "lucide-react";
import { useJobs } from "@/contexts/JobContext";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export type CandidateStatus = {
  approved: boolean;
  preparing: boolean;
  submitted: boolean;
  interviewing: boolean;
  offered: boolean;
};

export type Candidate = {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  status: CandidateStatus;
  applicationId?: string;
};

interface CandidateEntryProps {
  jobId: string;
}

export const CandidateEntry: React.FC<CandidateEntryProps> = ({ jobId }) => {
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidateLinkedin, setNewCandidateLinkedin] = useState("");
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  
  const { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    isLoading
  } = useJobs();
  
  const candidates = getCandidates(jobId);
  
  useEffect(() => {
    if (jobId) {
      loadCandidatesForJob(jobId);
    }
  }, [jobId]);

  const handleAddCandidate = async () => {
    if (newCandidateName.trim()) {
      setIsAddingCandidate(true);
      
      try {
        await addCandidate(jobId, {
          name: newCandidateName,
          email: newCandidateEmail,
          linkedinUrl: newCandidateLinkedin
        });
        
        // Reset form
        setNewCandidateName("");
        setNewCandidateEmail("");
        setNewCandidateLinkedin("");
      } finally {
        setIsAddingCandidate(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAddingCandidate) {
      handleAddCandidate();
    }
  };

  const handleStatusChange = (candidateId: string, statusKey: keyof CandidateStatus) => {
    updateCandidateStatus(jobId, candidateId, statusKey);
  };

  return (
    <div className="bg-white p-6 rounded-lg border mt-6">
      <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Candidates</h3>
      
      <div className="flex flex-col space-y-2 mb-4">
        <div className="grid grid-cols-12 gap-2">
          <Input
            placeholder="Enter candidate name"
            value={newCandidateName}
            onChange={(e) => setNewCandidateName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="col-span-4"
            disabled={isAddingCandidate}
          />
          <Input
            placeholder="Email address"
            value={newCandidateEmail}
            onChange={(e) => setNewCandidateEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="col-span-4"
            disabled={isAddingCandidate}
            type="email"
          />
          <Input
            placeholder="LinkedIn URL"
            value={newCandidateLinkedin}
            onChange={(e) => setNewCandidateLinkedin(e.target.value)}
            onKeyDown={handleKeyDown}
            className="col-span-3"
            disabled={isAddingCandidate}
          />
          <Button 
            onClick={handleAddCandidate} 
            size="sm" 
            className="col-span-1"
            disabled={isAddingCandidate || !newCandidateName.trim()}
          >
            {isAddingCandidate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading candidates...</span>
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-2 mb-2 text-sm font-medium text-gray-500">
            <div className="col-span-3">Candidate</div>
            <div className="text-center">Approved</div>
            <div className="text-center">Preparing</div>
            <div className="text-center">Submitted</div>
            <div className="text-center">Interviewing</div>
            <div className="text-center">Offered</div>
          </div>
          
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="grid grid-cols-8 gap-2 items-center p-2 rounded hover:bg-gray-50"
            >
              <div className="flex items-center col-span-3 gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeCandidate(jobId, candidate.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <div className="flex flex-col">
                  <span className="font-medium truncate">{candidate.name}</span>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    {candidate.email && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[100px]">{candidate.email}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{candidate.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {candidate.linkedinUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a 
                              href={candidate.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <Linkedin className="h-3 w-3" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View LinkedIn Profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Checkbox 
                  id={`approved-${candidate.id}`}
                  checked={candidate.status.approved}
                  onCheckedChange={() => 
                    handleStatusChange(candidate.id, "approved")
                  }
                />
              </div>
              
              <div className="flex justify-center">
                <Checkbox 
                  id={`preparing-${candidate.id}`}
                  checked={candidate.status.preparing}
                  onCheckedChange={() => 
                    handleStatusChange(candidate.id, "preparing")
                  }
                />
              </div>
              
              <div className="flex justify-center">
                <Checkbox 
                  id={`submitted-${candidate.id}`}
                  checked={candidate.status.submitted}
                  onCheckedChange={() => 
                    handleStatusChange(candidate.id, "submitted")
                  }
                />
              </div>
              
              <div className="flex justify-center">
                <Checkbox 
                  id={`interviewing-${candidate.id}`}
                  checked={candidate.status.interviewing}
                  onCheckedChange={() => 
                    handleStatusChange(candidate.id, "interviewing")
                  }
                />
              </div>
              
              <div className="flex justify-center">
                <Checkbox 
                  id={`offered-${candidate.id}`}
                  checked={candidate.status.offered}
                  onCheckedChange={() => 
                    handleStatusChange(candidate.id, "offered")
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 text-gray-500 bg-gray-50 rounded">
          No candidates added yet. Add your first candidate above.
        </div>
      )}
    </div>
  );
};
