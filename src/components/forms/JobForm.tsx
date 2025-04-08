
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
import { useFormPreview } from "./job-form/useFormPreview";

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
  const { messages } = useFormPreview(form);

  const { isLoading: clientsLoading } = useClientOptions();
  const { isLoading: flavorsLoading } = useFlavorOptions();
  const { isLoading: localesLoading } = useLocaleOptions();
  const { isLoading: statusesLoading } = useStatusOptions();
  const { isLoading: usersLoading } = useUserOptions();

  const isLoading = clientsLoading || flavorsLoading || localesLoading || statusesLoading || usersLoading;

  // Set form values for messages (in background)
  useEffect(() => {
    if (messages.m1 && messages.m2 && messages.m3) {
      form.setValue("m1", messages.m1);
      form.setValue("m2", messages.m2);
      form.setValue("m3", messages.m3);
    }
  }, [messages, form]);

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

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <JobFormBasicInfo handleClientSelection={handleClientSelection} />
        <JobFormCompanyDesc />
        <JobFormDetails form={form} />
        <JobFormLinks />
        <FormActions isEditing={isEditing} />
      </form>
    </div>
  );
}
