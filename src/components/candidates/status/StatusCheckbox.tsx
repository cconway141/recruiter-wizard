
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Candidate } from "../types";

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
  return (
    <div className="flex justify-center">
      <Checkbox 
        id={`${statusKey}-${candidateId}`}
        checked={checked}
        onCheckedChange={() => 
          onStatusChange(candidateId, statusKey)
        }
      />
    </div>
  );
};
