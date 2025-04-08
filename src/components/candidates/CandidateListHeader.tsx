
import React from "react";

export const CandidateListHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-8 gap-2 mb-2 text-sm font-medium text-gray-500">
      <div className="col-span-3">Candidate</div>
      <div className="text-center">Approved</div>
      <div className="text-center">Preparing</div>
      <div className="text-center">Submitted</div>
      <div className="text-center">Interviewing</div>
      <div className="text-center">Offered</div>
    </div>
  );
};
