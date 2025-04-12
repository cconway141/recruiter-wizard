
import { PageHeader } from "@/components/layout/PageHeader";
import { Job } from "@/types/job";
import { BackButton } from "./header/BackButton";
import { EditButton } from "./header/EditButton";
import { displayFormValue } from "@/utils/formFieldUtils";

interface JobHeaderProps {
  job: Job;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job }) => {
  // Ensure we display a valid string title
  const titleDisplay = job.internalTitle || "Untitled Job";
  
  // Format the date properly
  const formattedDate = job.date ? new Date(job.date).toLocaleDateString() : "Unknown date";
  
  return (
    <div className="mb-6">
      <BackButton />
      <div className="flex justify-between items-center">
        <PageHeader 
          title={titleDisplay} 
          description={`Added on ${formattedDate} by ${job.owner}`}
        />
        <EditButton jobId={job.id} />
      </div>
    </div>
  );
};
