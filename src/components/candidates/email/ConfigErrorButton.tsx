
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfigErrorButtonProps {
  className?: string;
}

export const ConfigErrorButton: React.FC<ConfigErrorButtonProps> = ({ className }) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      disabled={true}
    >
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span className="text-red-500">Gmail Setup Required</span>
    </Button>
  );
};
