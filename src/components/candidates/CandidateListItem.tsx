
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Candidate } from "./types";
import { StatusCheckbox } from "./status/StatusCheckbox";
import { EmailButton } from "./email/EmailButton";
import { LinkedinButton } from "./social/LinkedinButton";
import { EmailDialog } from "./email/EmailDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface CandidateListItemProps {
  candidate: Candidate;
  onRemove: (candidateId: string) => void;
  onStatusChange: (candidateId: string, statusKey: keyof Candidate['status']) => void;
  jobId: string; // Now we explicitly require the job ID
}

export const CandidateListItem: React.FC<CandidateListItemProps> = ({ 
  candidate, 
  onRemove, 
  onStatusChange,
  jobId 
}) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailDialogOpen(true);
  };

  // Replace getFirstThreadId with getThreadIdForJob
  const getThreadIdForJob = (): string | null => {
    if (!candidate.threadIds || !jobId) return null;
    
    // Check if we have a thread ID for this job
    const threadEntry = candidate.threadIds[jobId];
    if (!threadEntry) return null;
    
    // Handle both legacy (string) and new format (object with threadId property)
    if (typeof threadEntry === 'string') {
      return threadEntry;
    } else if (typeof threadEntry === 'object' && threadEntry !== null) {
      // Type assertion to prevent 'never' type error
      const threadObject = threadEntry as { threadId?: string };
      return threadObject.threadId || null;
    }
    
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-2 items-center p-2 rounded hover:bg-gray-50">
        <div className="flex items-center col-span-3 gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Candidate</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {candidate.name} from this job? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(candidate.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex flex-col">
            <span className="font-medium truncate">{candidate.name}</span>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              {candidate.email && (
                <EmailButton 
                  email={candidate.email}
                  onClick={handleEmailClick}
                />
              )}
              
              {candidate.linkedinUrl && (
                <LinkedinButton url={candidate.linkedinUrl} />
              )}
            </div>
          </div>
        </div>
        
        {/* Status checkboxes */}
        {Object.keys(candidate.status).map((statusKey) => (
          <StatusCheckbox
            key={statusKey}
            candidateId={candidate.id}
            statusKey={statusKey as keyof Candidate['status']}
            checked={candidate.status[statusKey as keyof Candidate['status']]}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Email Dialog */}
      <EmailDialog
        isOpen={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        candidateName={candidate.name}
        candidateEmail={candidate.email}
        jobId={jobId} // Pass the job ID to the EmailDialog
        candidateId={candidate.id}
        threadId={getThreadIdForJob()} // Use the job-specific thread ID
      />
    </>
  );
};
