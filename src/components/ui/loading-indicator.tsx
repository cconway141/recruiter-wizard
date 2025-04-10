
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/contexts/LoadingContext";

interface LoadingIndicatorProps {
  id?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  fallbackToSpinner?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  id,
  className,
  size = "md",
  showText = true,
  text = "Loading...",
  fallbackToSpinner = false,
}) => {
  const { isLoading } = useLoading();
  
  // If we have an ID, check if this specific operation is loading
  const shouldShow = id ? isLoading(id) : fallbackToSpinner;
  
  if (!shouldShow) return null;

  // Size mappings
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-gray-500", sizeClasses[size])} />
      {showText && <span className="ml-2 text-gray-500">{text}</span>}
    </div>
  );
};
