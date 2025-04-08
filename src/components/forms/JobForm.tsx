
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Job, Locale } from "@/types/job";
import { 
  calculateRates, 
  generateInternalTitle, 
  getWorkDetails, 
  getPayDetails, 
  generateM1, 
  generateM2, 
  generateM3 
} from "@/utils/jobUtils";
import { useJobs } from "@/contexts/JobContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import the component files
import { JobFormBasicInfo } from "./JobFormBasicInfo";
import { JobFormCompanyDesc } from "./JobFormCompanyDesc";
import { JobFormDetails } from "./JobFormDetails";
import { JobFormLinks } from "./JobFormLinks";
import { FormRatePreview } from "./FormRatePreview";
import { MessagePreviewSection } from "./MessagePreviewSection";

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
  const { addJob, updateJob } = useJobs();
  const navigate = useNavigate();
  const [previewTitle, setPreviewTitle] = useState("");
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: "",
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const form = useFormContext();
  const watchedFields = form.watch();

  const { isLoading: clientsLoading } = useClientOptions();
  const { isLoading: flavorsLoading } = useFlavorOptions();
  const { isLoading: localesLoading } = useLocaleOptions();
  const { isLoading: statusesLoading } = useStatusOptions();
  const { isLoading: usersLoading } = useUserOptions();

  const isLoading = clientsLoading || flavorsLoading || localesLoading || statusesLoading || usersLoading || isLoadingMessages;

  const handleClientSelection = async (clientName: string) => {
    try {
      // Fetch client data from Supabase to get the description
      const { data, error } = await supabase
        .from('clients')
        .select('description')
        .eq('name', clientName)
        .single();
        
      if (error) {
        console.error("Error fetching client description:", error);
        return;
      }
      
      if (data && data.description) {
        form.setValue("compDesc", data.description);
      }
    } catch (err) {
      console.error("Error in handleClientSelection:", err);
    }
  };

  useEffect(() => {
    // Generate internal title preview when relevant fields change
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      try {
        const newTitle = generateInternalTitle(
          watchedFields.client,
          watchedFields.candidateFacingTitle,
          watchedFields.flavor,
          watchedFields.locale as Locale
        );
        setPreviewTitle(newTitle);
      } catch (err) {
        console.error("Error generating internal title:", err);
      }
    }

    // Generate message previews when relevant fields change
    const generateMessages = async () => {
      if (watchedFields.candidateFacingTitle && watchedFields.compDesc && watchedFields.locale && watchedFields.skillsSought && watchedFields.videoQuestions) {
        try {
          setIsLoadingMessages(true);
          const locale = watchedFields.locale as Locale;
          const workDetails = await getWorkDetails(locale);
          const payDetails = await getPayDetails(locale);
          
          const m1 = generateM1("[First Name]", watchedFields.candidateFacingTitle, watchedFields.compDesc);
          const m2 = generateM2(watchedFields.candidateFacingTitle, payDetails, workDetails, watchedFields.skillsSought);
          const m3 = generateM3(watchedFields.videoQuestions);
          
          setMessages({ m1, m2, m3 });
        } catch (err) {
          console.error("Error generating messages:", err);
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };

    generateMessages();
  }, [watchedFields]);

  const onSubmit = async (values: any) => {
    try {
      const { previewName, ...jobData } = values;
      
      const { high, medium, low } = calculateRates(values.rate);
      
      const locale = values.locale as Locale;
      const workDetails = await getWorkDetails(locale);
      const payDetails = await getPayDetails(locale);
      
      const internalTitle = generateInternalTitle(
        values.client,
        values.candidateFacingTitle,
        values.flavor,
        locale
      );
      
      if (isEditing && job) {
        updateJob({
          ...job,
          ...jobData,
          locale: jobData.locale as Locale,
          status: jobData.status,
          flavor: jobData.flavor,
          internalTitle,
          highRate: high,
          mediumRate: medium,
          lowRate: low,
          workDetails,
          payDetails,
          m1: messages.m1,
          m2: messages.m2,
          m3: messages.m3
        });
      } else {
        addJob({
          jd: jobData.jd,
          candidateFacingTitle: jobData.candidateFacingTitle,
          status: jobData.status,
          skillsSought: jobData.skillsSought,
          minSkills: jobData.minSkills, 
          lir: jobData.lir,
          client: jobData.client,
          compDesc: jobData.compDesc,
          rate: jobData.rate,
          locale: jobData.locale as Locale,
          owner: jobData.owner,
          date: jobData.date,
          other: jobData.other || "",
          videoQuestions: jobData.videoQuestions,
          screeningQuestions: jobData.screeningQuestions,
          flavor: jobData.flavor,
        });
      }
      
      navigate("/");
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading options...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <JobFormBasicInfo handleClientSelection={handleClientSelection} />
          <JobFormCompanyDesc />
          <JobFormDetails form={form} />
          <JobFormLinks />
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="border-l pl-8">
        <div className="sticky top-8">
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          
          {previewTitle && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500">Internal Title:</h4>
              <p className="text-md font-semibold">{previewTitle}</p>
            </div>
          )}
          
          <FormRatePreview rate={watchedFields.rate} />
          <MessagePreviewSection messages={messages} />
        </div>
      </div>
    </div>
  );
}
