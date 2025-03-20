
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowLeft, Pencil } from "lucide-react";
import { Job } from "@/types/job";
import { useNavigate } from "react-router-dom";

interface JobHeaderProps {
  job: Job;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <div className="flex justify-between items-center">
        <PageHeader 
          title={job.internalTitle} 
          description={`Added on ${new Date(job.date).toLocaleDateString()} by ${job.owner}`}
        />
        <Button onClick={() => navigate(`/jobs/${job.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Job
        </Button>
      </div>
    </div>
  );
};
