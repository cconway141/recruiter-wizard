
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EmailDialogHeaderProps {
  candidateName: string;
  candidateEmail?: string;
}

export const EmailDialogHeader: React.FC<EmailDialogHeaderProps> = ({
  candidateName,
  candidateEmail,
}) => {
  return (
    <DialogHeader>
      <DialogTitle>Email to {candidateName}</DialogTitle>
      <DialogDescription>
        {candidateEmail ? (
          <>Send an email to {candidateEmail}</>
        ) : (
          <span className="text-red-500">No email address available</span>
        )}
      </DialogDescription>
    </DialogHeader>
  );
};
