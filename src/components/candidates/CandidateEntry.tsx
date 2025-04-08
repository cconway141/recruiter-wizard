
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, Plus, Trash } from "lucide-react";
import { useJobs } from "@/contexts/JobContext";
import { uuid } from "@/utils/uuid";

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
  status: CandidateStatus;
};

interface CandidateEntryProps {
  jobId: string;
}

export const CandidateEntry: React.FC<CandidateEntryProps> = ({ jobId }) => {
  const [newCandidateName, setNewCandidateName] = useState("");
  const { addCandidate, removeCandidate, updateCandidateStatus, getCandidates } = useJobs();
  const candidates = getCandidates(jobId);

  const handleAddCandidate = () => {
    if (newCandidateName.trim()) {
      // Create a new candidate object with the required structure
      const newCandidate: Candidate = {
        id: uuid(),
        name: newCandidateName,
        status: {
          approved: false,
          preparing: false,
          submitted: false,
          interviewing: false,
          offered: false
        }
      };
      
      addCandidate(jobId, newCandidate);
      setNewCandidateName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCandidate();
    }
  };

  const handleStatusChange = (candidateId: string, statusKey: keyof CandidateStatus) => {
    updateCandidateStatus(jobId, candidateId, statusKey);
  };

  return (
    <div className="bg-white p-6 rounded-lg border mt-6">
      <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Candidates</h3>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter candidate name"
          value={newCandidateName}
          onChange={(e) => setNewCandidateName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleAddCandidate} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      
      {candidates.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-medium text-gray-500">
            <div className="col-span-2">Name</div>
            <div className="text-center">Approved</div>
            <div className="text-center">Preparing</div>
            <div className="text-center">Submitted</div>
            <div className="text-center">Interviewing</div>
            <div className="text-center">Offered</div>
          </div>
          
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="grid grid-cols-7 gap-2 items-center p-2 rounded hover:bg-gray-50"
            >
              <div className="flex items-center col-span-2 gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeCandidate(jobId, candidate.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <span className="truncate">{candidate.name}</span>
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
