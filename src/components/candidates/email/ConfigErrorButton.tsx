
import React from "react";
import { AlertCircle, Mail } from "lucide-react";
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
    >
      <Mail className="h-4 w-4" />
      <span>Connect Gmail</span>
    </Button>
  );
};
