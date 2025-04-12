
import { useState } from "react";
import { Locale } from "@/types/job";
import { JobFormValues } from "../../JobFormDetails";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";

interface MessageGeneratorProps {
  setIsGeneratingMessages: (isGenerating: boolean) => void;
  toast: any;
}

export function useMessageGenerator({ setIsGeneratingMessages, toast }: MessageGeneratorProps) {
  const generateMessages = async (formValues: JobFormValues) => {
    setIsGeneratingMessages(true);
    try {
      console.log("Generating messages before form submission...");
      
      if (!formValues.candidateFacingTitle || !formValues.compDesc || !formValues.skillsSought) {
        throw new Error("Missing required fields for message generation");
      }
      
      const firstName = formValues.previewName || "[First Name]";
      const owner = formValues.owner || '';
      
      // Extract locale name properly
      const localeName = typeof formValues.locale === 'object' ? formValues.locale.name : formValues.locale;
      
      if (!formValues.workDetails || !formValues.payDetails) {
        if (localeName) {
          if (!formValues.workDetails) {
            formValues.workDetails = await getWorkDetails(localeName as Locale);
          }
          if (!formValues.payDetails) {
            formValues.payDetails = await getPayDetails(localeName as Locale);
          }
        }
      }
      
      const [m1, m2, m3] = await Promise.all([
        generateM1(firstName, formValues.candidateFacingTitle, formValues.compDesc, owner),
        generateM2(
          formValues.candidateFacingTitle, 
          formValues.payDetails || "", 
          formValues.workDetails || "", 
          formValues.skillsSought
        ),
        formValues.videoQuestions ? generateM3(formValues.videoQuestions) : ""
      ]);
      
      formValues.m1 = m1;
      formValues.m2 = m2;
      formValues.m3 = m3;
      
      console.log("Messages generated successfully");
      return formValues;
    } catch (error) {
      console.error("Error generating messages:", error);
      toast({
        title: "Error generating messages",
        description: "There was a problem generating message templates. You can edit them manually.",
        variant: "destructive",
      });
      return formValues;
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  return { generateMessages };
}
