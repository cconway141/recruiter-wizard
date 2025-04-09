
import React from 'react';
import { useParams } from 'react-router-dom';

const CandidateDetail = () => {
  const { candidateId } = useParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Candidate Details</h1>
      <p>Viewing candidate ID: {candidateId}</p>
    </div>
  );
};

export default CandidateDetail;
