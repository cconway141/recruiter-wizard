
import { useState } from "react";
import { MessageCard } from "@/components/messages/MessageCard";
import { Job } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface JobMessagesProps {
  job: Job;
}

export const JobMessages: React.FC<JobMessagesProps> = ({ job }) => {
  const { getCandidates } = useJobs();
  const candidates = getCandidates(job.id);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  
  // Personalize messages with candidate name
  const personalizeMessage = (message: string, candidateName: string) => {
    return message.replace(/\[First Name\]/g, candidateName.split(' ')[0]);
  };

  const m1 = selectedCandidate 
    ? personalizeMessage(job.m1, selectedCandidate) 
    : job.m1;
    
  const m2 = selectedCandidate 
    ? personalizeMessage(job.m2, selectedCandidate) 
    : job.m2;
    
  const m3 = selectedCandidate 
    ? personalizeMessage(job.m3, selectedCandidate) 
    : job.m3;

  return (
    <div className="bg-white p-6 rounded-lg border mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-recruiter-primary">Messages for LinkedIn Outreach</h3>
        
        {candidates.length > 0 && (
          <div className="w-full md:w-64">
            <Label htmlFor="candidate-select" className="mb-1 block">Personalize for candidate</Label>
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger id="candidate-select">
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Generic template</SelectItem>
                {candidates.map(candidate => (
                  <SelectItem key={candidate.id} value={candidate.name}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <MessageCard title="M1 - Initial Outreach" message={m1} />
        <MessageCard title="M2 - Detailed Information" message={m2} />
        <MessageCard title="M3 - Video & Final Questions" message={m3} />
      </div>
    </div>
  );
};
