
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Locale } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";
import { generateInternalTitle, calculateRates, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";
import { extractName, extractId, displayFormValue } from "@/utils/formFieldUtils";

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

  // For debugging
  useEffect(() => {
    console.log("Preview watched fields:", watchedFields);
  }, [watchedFields]);

  useEffect(() => {
    // Update internal title preview
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      const updateTitle = async () => {
        try {
          // Extract the flavor name and locale name consistently
          const flavorName = extractName(watchedFields.flavor);
          const localeName = extractName(watchedFields.locale);
          const clientName = extractName(watchedFields.client);
          const jobTitle = extractName(watchedFields.candidateFacingTitle);
          
          if (!flavorName || !localeName) {
            console.log("Missing flavor or locale for title generation");
            return;
          }
          
          const newTitle = await generateInternalTitle(
            clientName,
            jobTitle,
            flavorName,
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
      // Extract values properly, handling both string and object types
      const candidateFacingTitle = extractName(watchedFields.candidateFacingTitle);
      const compDesc = extractName(watchedFields.compDesc);
      const localeName = extractName(watchedFields.locale);
      const skillsSought = extractName(watchedFields.skillsSought);
      
      // Only update if we have all required fields
      if (candidateFacingTitle && compDesc && localeName && skillsSought) {
        try {
          // Generate preview messages
          const firstName = form.watch("previewName") || "[First Name]";
          const owner = extractName(watchedFields.owner) || '';
          
          // Fix: Await the promises to resolve, then update state
          const m1 = await generateM1(firstName, candidateFacingTitle, compDesc, owner);
          const m2 = await generateM2(
            candidateFacingTitle,
            extractName(watchedFields.payDetails) || "",
            extractName(watchedFields.workDetails) || "",
            skillsSought
          );
          
          let m3 = "";
          if (watchedFields.videoQuestions) {
            m3 = await generateM3(extractName(watchedFields.videoQuestions));
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
