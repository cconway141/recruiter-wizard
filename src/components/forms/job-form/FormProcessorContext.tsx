
import React, { createContext, useContext, ReactNode, useState } from "react";
import { Job } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
import { useFormProcessor } from "./FormProcessor";

interface FormProcessorContextType {
  handleSubmit: (values: JobFormValues) => void;
  isSubmitting: boolean;
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

  // The handleSubmit function is a simple wrapper around processJobForm
  const handleSubmit = (values: JobFormValues) => {
    console.log("FormProcessorContext handleSubmit called with values", values);
    
    // Update submission state immediately
    setIsSubmitting(true);
    
    // Process the form (this function will handle the API call and updating isSubmitting when done)
    processJobForm(values);
  };

  console.log("FormProcessorProvider - isSubmitting state:", isSubmitting);

  return (
    <FormProcessorContext.Provider 
      value={{ 
        handleSubmit, 
        isSubmitting, 
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
