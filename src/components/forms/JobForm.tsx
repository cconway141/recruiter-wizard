
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
  useUserOptions 
} from "@/hooks/use-dropdown-options";

interface JobFormProps {
  job?: Job;
  isEditing?: boolean;
}

export function JobForm({ job, isEditing = false }: JobFormProps) {
  const form = useFormContext<JobFormValues>();
  const { handleSubmit } = useFormProcessor({ job, isEditing });
  const { handleClientSelection } = useClientSelection(form);

  const { isLoading: clientsLoading } = useClientOptions();
  const { isLoading: flavorsLoading } = useFlavorOptions();
  const { isLoading: localesLoading } = useLocaleOptions();
  const { isLoading: statusesLoading } = useStatusOptions();
  const { isLoading: usersLoading } = useUserOptions();

  const isLoading = clientsLoading || flavorsLoading || localesLoading || statusesLoading || usersLoading;

  // Set default messages in background (invisible to user but needed for database)
  useEffect(() => {
    const locale = form.getValues("locale");
    const candidateFacingTitle = form.getValues("candidateFacingTitle");
    const compDesc = form.getValues("compDesc");
    const skillsSought = form.getValues("skillsSought");
    const videoQuestions = form.getValues("videoQuestions");
    
    if (locale && candidateFacingTitle && compDesc && skillsSought) {
      // All required fields are filled, we could generate messages in background
      // but don't need to show them to user
    }
  }, [form]);

  // Handle initial client selection for company description
  useEffect(() => {
    const clientValue = form.getValues("client");
    if (clientValue) {
      handleClientSelection(clientValue);
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

  const onSubmitForm = form.handleSubmit(handleSubmit);

  console.log("Form is valid:", form.formState.isValid);
  console.log("Form errors:", form.formState.errors);

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
