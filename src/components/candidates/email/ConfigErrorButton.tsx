
import React from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfigErrorButtonProps {
  className?: string;
  onClick?: () => void;
  isConnected?: boolean;
  onDisconnect?: () => void;
}

export const ConfigErrorButton: React.FC<ConfigErrorButtonProps> = ({ 
  className, 
  onClick,
  isConnected = false,
  onDisconnect
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center text-green-500 font-medium">
          <CheckCircle className="h-4 w-4 mr-2" />
          Gmail Connected
        </span>
        
        {onDisconnect && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={onDisconnect}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Button
      type="button"
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      onClick={onClick}
    >
      <Mail className="h-4 w-4" />
      <span>Connect Gmail API</span>
    </Button>
  );
};
