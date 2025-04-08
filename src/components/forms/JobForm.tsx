
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Job } from "@/types/job";

// Import the component files
import { JobFormBasicInfo } from "./JobFormBasicInfo";
import { JobFormCompanyDesc } from "./JobFormCompanyDesc";
import { JobFormDetails, JobFormValues } from "./JobFormDetails";
import { JobFormLinks } from "./JobFormLinks";
import { FormActions } from "./job-form/FormActions";
import { useFormProcessor } from "./job-form/FormProcessor";
import { useClientSelection } from "./job-form/useClientSelection";

import { 
  useClientOptions, 
  useFlavorOptions, 
  useLocaleOptions, 
  useStatusOptions,
} from "@/hooks/use-dropdown-options";
import { useUserOptions } from "@/hooks/useUserOptions";

interface JobFormProps {
  job?: Job;
  isEditing?: boolean;
}

export function JobForm({ job, isEditing = false }: JobFormProps) {
  const form = useFormContext<JobFormValues>();
  const { handleSubmit } = useFormProcessor({ job, isEditing }) || { handleSubmit: () => {} };
  const { handleClientSelection } = useClientSelection(form);

  const { isLoading: clientsLoading } = useClientOptions();
  const { isLoading: flavorsLoading } = useFlavorOptions();
  const { isLoading: localesLoading } = useLocaleOptions();
  const { isLoading: statusesLoading } = useStatusOptions();
  const { isLoading: usersLoading } = useUserOptions();

  const isLoading = clientsLoading || flavorsLoading || localesLoading || statusesLoading || usersLoading;

  // Add a null check for form before accessing getValues
  useEffect(() => {
    if (!form || !form.getValues) {
      console.warn("Form context is not properly initialized");
      return;
    }
    
    try {
      const locale = form.getValues("locale");
      const candidateFacingTitle = form.getValues("candidateFacingTitle");
      const compDesc = form.getValues("compDesc");
      const skillsSought = form.getValues("skillsSought");
      const videoQuestions = form.getValues("videoQuestions");
      
      if (locale && candidateFacingTitle && compDesc && skillsSought) {
        // All required fields are filled, we could generate messages in background
        // but don't need to show them to user
      }
    } catch (err) {
      console.error("Error accessing form values:", err);
    }
  }, [form]);

  // Handle initial client selection for company description
  useEffect(() => {
    if (!form || !form.getValues) {
      console.warn("Form context is not properly initialized for client selection");
      return;
    }
    
    try {
      const clientValue = form.getValues("client");
      if (clientValue) {
        handleClientSelection(clientValue);
      }
    } catch (err) {
      console.error("Error handling client selection:", err);
    }
  }, [form, handleClientSelection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading options...</span>
      </div>
    );
  }

  // Add a safeguard for form.handleSubmit to prevent null errors
  const onSubmitForm = form && typeof form.handleSubmit === 'function' 
    ? form.handleSubmit(handleSubmit)
    : (e: React.FormEvent) => { 
        e.preventDefault(); 
        console.error("Form context not properly initialized"); 
      };

  return (
    <div>
      <form onSubmit={onSubmitForm} className="space-y-6">
        {form ? (
          <>
            <JobFormBasicInfo handleClientSelection={handleClientSelection} />
            <JobFormCompanyDesc />
            <JobFormDetails form={form} />
            <JobFormLinks />
            <FormActions isEditing={isEditing} />
          </>
        ) : (
          <div className="text-center p-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500 mb-2" />
            <p>Initializing form...</p>
          </div>
        )}
      </form>
    </div>
  );
}
