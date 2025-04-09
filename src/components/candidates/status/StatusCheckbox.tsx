
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Candidate } from "../types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusCheckboxProps {
  candidateId: string;
  statusKey: keyof Candidate['status'];
  checked: boolean;
  onStatusChange: (candidateId: string, statusKey: keyof Candidate['status']) => void;
}

export const StatusCheckbox: React.FC<StatusCheckboxProps> = ({
  candidateId,
  statusKey,
  checked,
  onStatusChange
}) => {
  // Convert camelCase status key to a more readable format
  const formatStatusKey = (key: string) => 
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div className="flex justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "transition-all duration-200 ease-in-out",
              "hover:scale-110 hover:brightness-110",
              "focus-within:scale-110 focus-within:brightness-110",
              "active:scale-95"
            )}>
              <Checkbox 
                id={`${statusKey}-${candidateId}`}
                checked={checked}
                onCheckedChange={() => onStatusChange(candidateId, statusKey)}
                className={cn(
                  "peer",
                  checked ? "bg-primary text-primary-foreground" : "bg-background",
                  "hover:border-primary hover:ring-2 hover:ring-primary hover:ring-opacity-50",
                  "transition-all duration-200 ease-in-out"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {formatStatusKey(statusKey)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

