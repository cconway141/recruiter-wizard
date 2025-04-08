
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Mail, Linkedin } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Candidate } from "./types";

interface CandidateListItemProps {
  candidate: Candidate;
  onRemove: (candidateId: string) => void;
  onStatusChange: (candidateId: string, statusKey: keyof Candidate['status']) => void;
}

export const CandidateListItem: React.FC<CandidateListItemProps> = ({ 
  candidate, 
  onRemove, 
  onStatusChange 
}) => {
  return (
    <div className="grid grid-cols-8 gap-2 items-center p-2 rounded hover:bg-gray-50">
      <div className="flex items-center col-span-3 gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(candidate.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <span className="font-medium truncate">{candidate.name}</span>
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            {candidate.email && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[100px]">{candidate.email}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{candidate.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {candidate.linkedinUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href={candidate.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Linkedin className="h-3 w-3" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View LinkedIn Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Checkbox 
          id={`approved-${candidate.id}`}
          checked={candidate.status.approved}
          onCheckedChange={() => 
            onStatusChange(candidate.id, "approved")
          }
        />
      </div>
      
      <div className="flex justify-center">
        <Checkbox 
          id={`preparing-${candidate.id}`}
          checked={candidate.status.preparing}
          onCheckedChange={() => 
            onStatusChange(candidate.id, "preparing")
          }
        />
      </div>
      
      <div className="flex justify-center">
        <Checkbox 
          id={`submitted-${candidate.id}`}
          checked={candidate.status.submitted}
          onCheckedChange={() => 
            onStatusChange(candidate.id, "submitted")
          }
        />
      </div>
      
      <div className="flex justify-center">
        <Checkbox 
          id={`interviewing-${candidate.id}`}
          checked={candidate.status.interviewing}
          onCheckedChange={() => 
            onStatusChange(candidate.id, "interviewing")
          }
        />
      </div>
      
      <div className="flex justify-center">
        <Checkbox 
          id={`offered-${candidate.id}`}
          checked={candidate.status.offered}
          onCheckedChange={() => 
            onStatusChange(candidate.id, "offered")
          }
        />
      </div>
    </div>
  );
};
