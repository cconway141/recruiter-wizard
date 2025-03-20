
import { Job } from "@/types/job";

interface JobSidebarProps {
  job: Job;
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ job }) => {
  return (
    <div className="col-span-1">
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Work & Pay Details</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-500 mb-1">Work Details</h4>
          <p className="whitespace-pre-line">{job.workDetails}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-500 mb-1">Pay Details</h4>
          <p className="whitespace-pre-line">{job.payDetails}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Screening Questions</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-500 mb-1">Video Questions</h4>
          <p className="whitespace-pre-line">{job.videoQuestions}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-500 mb-1">Screening Questions</h4>
          <p className="whitespace-pre-line">{job.screeningQuestions}</p>
        </div>
      </div>
    </div>
  );
};
