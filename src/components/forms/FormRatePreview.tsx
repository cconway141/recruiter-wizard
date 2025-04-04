
import React from "react";

interface FormRatePreviewProps {
  rate: number;
}

export function FormRatePreview({ rate }: FormRatePreviewProps) {
  if (!rate || rate <= 0) {
    return null;
  }

  const highRate = Math.round(rate * 0.55);
  const mediumRate = Math.round(rate * 0.4);
  const lowRate = Math.round(rate * 0.2);

  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      <div className="p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-500">High Rate</h4>
        <p className="text-lg font-semibold">${highRate}/hr</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-500">Medium Rate</h4>
        <p className="text-lg font-semibold">${mediumRate}/hr</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-500">Low Rate</h4>
        <p className="text-lg font-semibold">${lowRate}/hr</p>
      </div>
    </div>
  );
}
