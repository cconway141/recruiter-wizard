
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfigErrorButtonProps {
  className?: string;
  onClick?: () => void;
}

export const ConfigErrorButton: React.FC<ConfigErrorButtonProps> = ({ 
  className, 
  onClick 
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span className="text-red-500">Gmail Setup Required</span>
    </Button>
  );
};
