
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFormProcessorContext } from "./FormProcessorContext";
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";

interface FormActionsProps {
  isEditing: boolean;
  job?: Job;
}

export const FormActions = React.memo(function FormActions({ isEditing, job }: FormActionsProps) {
  const navigate = useNavigate();
  const { isSubmitting, resetSubmissionState } = useFormProcessorContext();
  
  // Handle hung submission requests with a timeout safety
  useEffect(() => {
    let submissionTimeout: NodeJS.Timeout | null = null;
    
    if (isSubmitting) {
      console.log("Setting submission timeout safety");
      // Set a timeout to reset if submission takes too long (30 seconds)
      submissionTimeout = setTimeout(() => {
        console.log("Submission timeout triggered - looks like a hung request");
        resetSubmissionState();
        toast({
          title: "Submission Timeout",
          description: "The form submission is taking longer than expected. Please try again.",
          variant: "destructive",
        });
      }, 30000); // 30 seconds timeout
    }
    
    return () => {
      if (submissionTimeout) {
        clearTimeout(submissionTimeout);
      }
    };
  }, [isSubmitting, resetSubmissionState]);
  
  // Reduced the frequency of logging to avoid console spam
  // console.log("FormActions render - isSubmitting:", isSubmitting);
  
  return (
    <div className="flex justify-end gap-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate("/")}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
        className="min-w-[120px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : (
          isEditing ? "Update Job" : "Create Job"
        )}
      </Button>
    </div>
  );
});
