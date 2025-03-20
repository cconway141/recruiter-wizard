
import { MessageCard } from "@/components/messages/MessageCard";
import { Job } from "@/types/job";

interface JobMessagesProps {
  job: Job;
}

export const JobMessages: React.FC<JobMessagesProps> = ({ job }) => {
  return (
    <div className="bg-white p-6 rounded-lg border mt-6">
      <h3 className="text-xl font-semibold mb-6 text-recruiter-primary">Messages for LinkedIn Outreach</h3>
      
      <div className="space-y-6">
        <MessageCard title="M1 - Initial Outreach" message={job.m1} />
        <MessageCard title="M2 - Detailed Information" message={job.m2} />
        <MessageCard title="M3 - Video & Final Questions" message={job.m3} />
      </div>
    </div>
  );
};
