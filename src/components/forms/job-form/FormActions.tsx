
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormActionsProps {
  isEditing: boolean;
}

export function FormActions({ isEditing }: FormActionsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={() => navigate("/")}>
        Cancel
      </Button>
      <Button type="submit">
        {isEditing ? "Update Job" : "Create Job"}
      </Button>
    </div>
  );
}
