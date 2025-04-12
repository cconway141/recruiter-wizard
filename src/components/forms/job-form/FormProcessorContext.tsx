
import React, { createContext, useContext, ReactNode } from "react";
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
  // Single instance of form processor in the entire form tree
  const { handleSubmit, isSubmitting } = useFormProcessor({ job, isEditing });

  console.log("FormProcessorProvider - isSubmitting:", isSubmitting);

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
