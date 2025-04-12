
import React from "react";
import { FormRatePreview } from "../FormRatePreview";
import { MessagePreviewSection } from "../MessagePreviewSection";
import { JobFormValues } from "../JobFormDetails";

interface FormPreviewProps {
  previewTitle: string;
  watchedFields: Partial<JobFormValues>;
  messages: {
    m1: string;
    m2: string;
    m3: string;
  };
}

export function FormPreview({ previewTitle, watchedFields, messages }: FormPreviewProps) {
  // Extract values properly, handling both string and object types
  const candidateFacingTitle = watchedFields.candidateFacingTitle;
  const compDesc = watchedFields.compDesc;
  const locale = typeof watchedFields.locale === 'object' ? watchedFields.locale.name : watchedFields.locale;
  const skillsSought = watchedFields.skillsSought;
  
  // Check if all required fields for message preview are filled
  const canShowMessages = 
    candidateFacingTitle && 
    compDesc && 
    locale && 
    skillsSought;

  return (
    <div className="border-l pl-8">
      <div className="sticky top-8">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        
        {previewTitle && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500">Internal Title:</h4>
            <p className="text-md font-semibold">{previewTitle}</p>
          </div>
        )}
        
        <FormRatePreview rate={watchedFields.rate || 0} />
        
        {canShowMessages ? (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Message Previews</h4>
            <MessagePreviewSection messages={messages} />
          </div>
        ) : (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Complete all required fields (job title, company description, locale, and skills) to see message previews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
