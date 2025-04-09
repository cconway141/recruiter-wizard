
import React from "react";
import { Linkedin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LinkedinButtonProps {
  url: string;
}

export const LinkedinButton: React.FC<LinkedinButtonProps> = ({ url }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a 
            href={url} 
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
  );
};
