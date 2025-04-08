
import { PageHeader } from "@/components/layout/PageHeader";
import { Job } from "@/types/job";
import { BackButton } from "./header/BackButton";
import { EditButton } from "./header/EditButton";

interface JobHeaderProps {
  job: Job;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job }) => {
  return (
    <div className="mb-6">
      <BackButton />
      <div className="flex justify-between items-center">
        <PageHeader 
          title={job.internalTitle} 
          description={`Added on ${new Date(job.date).toLocaleDateString()} by ${job.owner}`}
        />
        <EditButton jobId={job.id} />
      </div>
    </div>
  );
};
