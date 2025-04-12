
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useFormProcessor } from "./FormProcessor";

interface FormActionsProps {
  isEditing: boolean;
}

export function FormActions({ isEditing }: FormActionsProps) {
  const navigate = useNavigate();
  const form = useFormContext();
  const { isSubmitting } = useFormProcessor({ isEditing }) || { isSubmitting: false };
  
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
