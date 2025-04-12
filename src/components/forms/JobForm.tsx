
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Job } from "@/types/job";

// Import the component files
import { JobFormBasicInfo } from "./basic-info";
import { JobFormCompanyDesc } from "./JobFormCompanyDesc";
import { JobFormDetails, JobFormValues } from "./JobFormDetails";
import { JobFormLinks } from "./JobFormLinks";
import { FormActions } from "./job-form/FormActions";
import { FormProcessorProvider, useFormProcessorContext } from "./job-form/FormProcessorContext";
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

  return (
    <FormProcessorProvider job={job} isEditing={isEditing}>
      <JobFormContent 
        form={form} 
        handleClientSelection={handleClientSelection} 
        job={job} 
        isEditing={isEditing} 
      />
    </FormProcessorProvider>
  );
}

interface JobFormContentProps {
  form: ReturnType<typeof useFormContext<JobFormValues>>;
  handleClientSelection: (clientName: string) => void;
  job?: Job;
  isEditing: boolean;
}

function JobFormContent({ form, handleClientSelection, job, isEditing }: JobFormContentProps) {
  const { handleSubmit } = useFormProcessorContext();

  // Now we can safely use form methods
  const onSubmitForm = form.handleSubmit((values) => {
    console.log("Form submitted with values:", values);
    handleSubmit(values);
  });

  return (
    <div>
      <form onSubmit={onSubmitForm} className="space-y-6">
        <JobFormBasicInfo handleClientSelection={handleClientSelection} />
        <JobFormCompanyDesc />
        <JobFormDetails />
        <JobFormLinks />
        <FormActions isEditing={isEditing} job={job} />
      </form>
    </div>
  );
}
