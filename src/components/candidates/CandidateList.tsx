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
  jobId: string;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  onRemoveCandidate,
  onStatusChange,
  jobId
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading candidates...</span>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-md">
      <CandidateListHeader />
      
      <div className="divide-y">
        {candidates.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No candidates yet. Add your first candidate above.
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateListItem
              key={candidate.id}
              candidate={candidate}
              onRemove={onRemoveCandidate}
              onStatusChange={onStatusChange}
              jobId={jobId}
            />
          ))
        )}
      </div>
    </div>
  );
};
