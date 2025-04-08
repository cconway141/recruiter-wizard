
import React from "react";
import { cn } from "@/lib/utils";
import { calculateRates } from "@/utils/rateUtils";

interface FormRatePreviewProps {
  rate: number;
}

export function FormRatePreview({ rate }: FormRatePreviewProps) {
  if (!rate || rate <= 0) {
    return null;
  }

  const { high, medium, low } = calculateRates(rate);

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
