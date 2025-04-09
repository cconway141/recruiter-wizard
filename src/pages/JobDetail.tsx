
import React from 'react';
import { useParams } from 'react-router-dom';

const JobDetail = () => {
  const { jobId } = useParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Details</h1>
      <p>Viewing job ID: {jobId}</p>
    </div>
  );
};

export default JobDetail;
