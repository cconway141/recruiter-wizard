
import React from "react";
import { Loader2 } from "lucide-react";
import { CandidateListHeader } from "./CandidateListHeader";
import { CandidateListItem } from "./CandidateListItem";
import { Candidate } from "./types";

interface CandidateListProps {
  candidates: Candidate[];
  isLoading: boolean;
  onRemoveCandidate: (candidateId: string) => void;
  onStatusChange: (candidateId: string, statusKey: keyof Candidate['status']) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  onRemoveCandidate,
  onStatusChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading candidates...</span>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 bg-gray-50 rounded">
        No candidates added yet. Add your first candidate above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <CandidateListHeader />
      
      {candidates.map((candidate) => (
        <CandidateListItem
          key={candidate.id}
          candidate={candidate}
          onRemove={onRemoveCandidate}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};
