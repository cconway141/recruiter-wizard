
import React, { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { Job } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
import { useFormProcessor } from "./FormProcessor";

interface FormProcessorContextType {
  handleSubmit: (values: JobFormValues) => void;
  isSubmitting: boolean;
  resetSubmissionState: () => void;
  job?: Job;
  isEditing: boolean;
}

const FormProcessorContext = createContext<FormProcessorContextType | undefined>(undefined);

interface FormProcessorProviderProps {
  children: ReactNode;
  job?: Job;
  isEditing?: boolean;
}

export function FormProcessorProvider({ 
  children, 
  job, 
  isEditing = false 
}: FormProcessorProviderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { processJobForm } = useFormProcessor({ 
    job, 
    isEditing,
    setSubmittingState: setIsSubmitting 
  });

  // Reset submission state (useful for timeouts or error handling)
  const resetSubmissionState = useCallback(() => {
    console.log("Manually resetting submission state");
    setIsSubmitting(false);
  }, []);

  // The handleSubmit function is a simple wrapper around processJobForm
  const handleSubmit = (values: JobFormValues) => {
    console.log("FormProcessorContext handleSubmit called with values", values);
    
    // Check if we're already submitting to prevent double submissions
    if (isSubmitting) {
      console.log("Submission already in progress - ignoring duplicate submission");
      return;
    }
    
    // Update submission state immediately
    setIsSubmitting(true);
    
    // Process the form (this function will handle the API call and updating isSubmitting when done)
    processJobForm(values).catch(err => {
      console.error("Error in form submission:", err);
      // Always ensure we reset state on errors
      setIsSubmitting(false);
    });
  };

  console.log("FormProcessorProvider - isSubmitting state:", isSubmitting);

  return (
    <FormProcessorContext.Provider 
      value={{ 
        handleSubmit, 
        isSubmitting, 
        resetSubmissionState,
        job, 
        isEditing 
      }}
    >
      {children}
    </FormProcessorContext.Provider>
  );
}

export function useFormProcessorContext() {
  const context = useContext(FormProcessorContext);
  
  if (context === undefined) {
    throw new Error("useFormProcessorContext must be used within a FormProcessorProvider");
  }
  
  return context;
}
