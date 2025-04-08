
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";

interface CandidateFormProps {
  onAddCandidate: (name: string, email: string, linkedinUrl: string) => Promise<void>;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onAddCandidate }) => {
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newCandidateLinkedin, setNewCandidateLinkedin] = useState("");
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  const handleAddCandidate = async () => {
    if (newCandidateName.trim()) {
      setIsAddingCandidate(true);
      
      try {
        await onAddCandidate(
          newCandidateName,
          newCandidateEmail,
          newCandidateLinkedin
        );
        
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

  return (
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
  );
};
