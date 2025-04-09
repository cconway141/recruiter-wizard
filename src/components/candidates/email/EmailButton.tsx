
import React from "react";
import { Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EmailButtonProps {
  email: string;
  onClick: (e: React.MouseEvent) => void;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ email, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={onClick}
          >
            <Mail className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[100px]">{email}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Send email to {email}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
