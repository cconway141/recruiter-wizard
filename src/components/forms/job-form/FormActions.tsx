
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useFormProcessor } from "./FormProcessor";
import { Job } from "@/types/job";

interface FormActionsProps {
  isEditing: boolean;
  job?: Job;
}

export function FormActions({ isEditing, job }: FormActionsProps) {
  const navigate = useNavigate();
  const form = useFormContext();
  const { handleSubmit, isSubmitting } = useFormProcessor({ job, isEditing });
  
  // Only disable the submit button if we're actually submitting
  const isDisabled = isSubmitting === true;
  
  // Explicitly log the submission state
  console.log("FormActions - isSubmitting:", isSubmitting);
  
  return (
    <div className="flex justify-end gap-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate("/")}
        disabled={isDisabled}
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        disabled={isDisabled}
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
}
