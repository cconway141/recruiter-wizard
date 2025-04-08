
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Locale } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
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
  };

  useEffect(() => {
    // Update internal title preview
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      const newTitle = generateInternalTitle(
        watchedFields.client,
        watchedFields.candidateFacingTitle,
        watchedFields.flavor,
        watchedFields.locale as Locale
      );
      setPreviewTitle(newTitle);
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
      // Only update if we have all required fields
      if (
        watchedFields.candidateFacingTitle &&
        watchedFields.compDesc &&
        watchedFields.locale &&
        watchedFields.skillsSought
      ) {
        try {
          // Generate preview messages
          const firstName = form.watch("previewName") || "[First Name]";
          const m1 = await generateM1(firstName, watchedFields.candidateFacingTitle, watchedFields.compDesc);
          const m2 = await generateM2(
            watchedFields.candidateFacingTitle,
            watchedFields.payDetails || "",
            watchedFields.workDetails || "",
            watchedFields.skillsSought
          );
          
          let m3 = "";
          if (watchedFields.videoQuestions) {
            m3 = await generateM3(watchedFields.videoQuestions);
          }
          
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
