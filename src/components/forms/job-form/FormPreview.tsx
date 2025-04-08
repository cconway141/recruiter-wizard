
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
        <MessagePreviewSection messages={messages} />
      </div>
    </div>
  );
}
