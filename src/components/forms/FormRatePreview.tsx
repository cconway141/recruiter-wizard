
import React from "react";
import { cn } from "@/lib/utils";

interface FormRatePreviewProps {
  rate: number;
  highRate?: number;
  mediumRate?: number;
  lowRate?: number;
}

export function FormRatePreview({ rate, highRate, mediumRate, lowRate }: FormRatePreviewProps) {
  if (!rate || rate <= 0) {
    return null;
  }

  // Use the passed in rates if available, otherwise they will be calculated elsewhere
  const high = typeof highRate === 'number' ? highRate : 0;
  const medium = typeof mediumRate === 'number' ? mediumRate : 0;
  const low = typeof lowRate === 'number' ? lowRate : 0;

  return (
    <div className="mb-2 flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Rates:</span>
      <div className="flex space-x-2">
        <div className="bg-gray-100 px-2 py-1 rounded-md text-xs">
          <span className="font-medium">High:</span> ${high}/hr
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded-md text-xs">
          <span className="font-medium">Medium:</span> ${medium}/hr
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded-md text-xs">
          <span className="font-medium">Low:</span> ${low}/hr
        </div>
      </div>
    </div>
  );
}
