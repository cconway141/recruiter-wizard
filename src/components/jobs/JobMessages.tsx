
import { useState, useEffect } from "react";
import { MessageCard } from "@/components/messages/MessageCard";
import { Job } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateM1, generateM2, generateM3 } from "@/utils/jobUtils";

interface JobMessagesProps {
  job: Job;
}

export const JobMessages: React.FC<JobMessagesProps> = ({ job }) => {
  const { getCandidates } = useJobs();
  const candidates = getCandidates(job.id);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [messages, setMessages] = useState({
    m1: job.m1 || "",
    m2: job.m2 || "",
    m3: job.m3 || ""
  });
  
  // Load fresh templates from the database when component mounts or job changes
  useEffect(() => {
    const refreshMessages = async () => {
      try {
        const m1 = await generateM1("[First Name]", job.candidateFacingTitle, job.compDesc, job.owner);
        const m2 = await generateM2(job.candidateFacingTitle, job.payDetails, job.workDetails, job.skillsSought);
        const m3 = await generateM3(job.videoQuestions);
        
        setMessages({ m1, m2, m3 });
      } catch (err) {
        console.error("Error refreshing messages:", err);
      }
    };
    
    refreshMessages();
  }, [job]);
  
  // Personalize messages with candidate name
  const personalizeMessage = (message: string, candidateName: string) => {
    return message.replace(/\[First Name\]/g, candidateName.split(' ')[0]);
  };

  const m1 = selectedCandidate 
    ? personalizeMessage(messages.m1, selectedCandidate) 
    : messages.m1;
    
  const m2 = selectedCandidate 
    ? personalizeMessage(messages.m2, selectedCandidate) 
    : messages.m2;
    
  const m3 = selectedCandidate 
    ? personalizeMessage(messages.m3, selectedCandidate) 
    : messages.m3;

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
