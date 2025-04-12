
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFormProcessorContext } from "./FormProcessorContext";
import { Job } from "@/types/job";

interface FormActionsProps {
  isEditing: boolean;
  job?: Job;
}

export function FormActions({ isEditing, job }: FormActionsProps) {
  const navigate = useNavigate();
  const { isSubmitting } = useFormProcessorContext();
  
  // Explicitly log the submission state
  console.log("FormActions render - isSubmitting:", isSubmitting);
  
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
}
