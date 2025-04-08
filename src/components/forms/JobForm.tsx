
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

  // Effect to handle form value updates for message generation
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
      
      console.log("Form values loaded:", { locale, candidateFacingTitle, compDesc, skillsSought });
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

  if (!form) {
    return (
      <div className="text-center p-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
        <p>Form context not available. Please refresh the page.</p>
      </div>
    );
  }

  // Now we can safely use form methods
  const onSubmitForm = form.handleSubmit(handleSubmit);

  return (
    <div>
      <form onSubmit={onSubmitForm} className="space-y-6">
        <JobFormBasicInfo handleClientSelection={handleClientSelection} />
        <JobFormCompanyDesc />
        <JobFormDetails form={form} />
        <JobFormLinks />
        <FormActions isEditing={isEditing} />
      </form>
    </div>
  );
}
