
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Locale } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";
import { generateInternalTitle, calculateRates, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";

export function useFormPreview(form: UseFormReturn<JobFormValues>) {
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewHighRate, setPreviewHighRate] = useState(0);
  const [previewMediumRate, setPreviewMediumRate] = useState(0);
  const [previewLowRate, setPreviewLowRate] = useState(0);
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: ""
  });

  // Watch the form values to update the preview
  const watchedFields = {
    client: form.watch("client"),
    candidateFacingTitle: form.watch("candidateFacingTitle"),
    flavor: form.watch("flavor"),
    locale: form.watch("locale"),
    rate: form.watch("rate"),
    compDesc: form.watch("compDesc"),
    skillsSought: form.watch("skillsSought"),
    videoQuestions: form.watch("videoQuestions"),
    payDetails: form.watch("payDetails"),
    workDetails: form.watch("workDetails"),
    owner: form.watch("owner")
  };

  useEffect(() => {
    // Update internal title preview
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      const updateTitle = async () => {
        try {
          // Extract the flavor name and locale name from objects if needed
          const flavorName = typeof watchedFields.flavor === 'object' && watchedFields.flavor 
            ? watchedFields.flavor.name 
            : watchedFields.flavor;
            
          const localeName = typeof watchedFields.locale === 'object' && watchedFields.locale 
            ? watchedFields.locale.name 
            : watchedFields.locale;
          
          if (!flavorName || !localeName) {
            console.log("Missing flavor or locale for title generation");
            return;
          }
          
          const newTitle = await generateInternalTitle(
            watchedFields.client,
            watchedFields.candidateFacingTitle,
            flavorName as string,
            localeName as Locale
          );
          setPreviewTitle(newTitle);
        } catch (err) {
          console.error("Error generating title preview:", err);
        }
      };
      updateTitle();
    }

    // Update rate previews
    if (watchedFields.rate) {
      const rate = Number(watchedFields.rate);
      const { high, medium, low } = calculateRates(rate);
      setPreviewHighRate(high);
      setPreviewMediumRate(medium);
      setPreviewLowRate(low);
    }
  }, [
    watchedFields.client,
    watchedFields.candidateFacingTitle,
    watchedFields.flavor,
    watchedFields.locale,
    watchedFields.rate,
  ]);

  // Update message previews
  useEffect(() => {
    const updateMessages = async () => {
      // Extract proper values, handling both object and string types
      const candidateFacingTitle = watchedFields.candidateFacingTitle;
      const compDesc = watchedFields.compDesc;
      
      const localeName = typeof watchedFields.locale === 'object' && watchedFields.locale 
        ? watchedFields.locale.name 
        : watchedFields.locale;
        
      const skillsSought = watchedFields.skillsSought;
      
      // Only update if we have all required fields
      if (candidateFacingTitle && compDesc && localeName && skillsSought) {
        try {
          // Generate preview messages
          const firstName = form.watch("previewName") || "[First Name]";
          const owner = watchedFields.owner || "";
          
          // Fix: Await the promises to resolve, then update state
          const m1 = await generateM1(firstName, candidateFacingTitle, compDesc, owner);
          const m2 = await generateM2(
            candidateFacingTitle,
            watchedFields.payDetails || "",
            watchedFields.workDetails || "",
            skillsSought
          );
          
          let m3 = "";
          if (watchedFields.videoQuestions) {
            m3 = await generateM3(watchedFields.videoQuestions);
          }
          
          // Update state with resolved values, not promises
          setMessages({ m1, m2, m3 });
        } catch (err) {
          console.error("Error generating message previews:", err);
        }
      }
    };

    updateMessages();
  }, [
    form,
    watchedFields.candidateFacingTitle,
    watchedFields.compDesc,
    watchedFields.locale,
    watchedFields.skillsSought,
    watchedFields.videoQuestions,
    watchedFields.payDetails,
    watchedFields.workDetails,
    watchedFields.owner
  ]);

  return {
    previewTitle,
    previewHighRate,
    previewMediumRate,
    previewLowRate,
    watchedFields,
    messages
  };
}
