
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfigErrorButtonProps {
  className?: string;
  isConnected: boolean;
  onClick?: () => void;
  onDisconnect?: () => void;
}

export const ConfigErrorButton: React.FC<ConfigErrorButtonProps> = ({
  className = "",
  isConnected,
  onClick,
  onDisconnect
}) => {
  // Always render one of these buttons immediately without loading states
  if (isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className={`flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 ${className}`}
          disabled={true}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Gmail Connected</span>
        </Button>
        
        {onDisconnect && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onDisconnect}
          >
            Disconnect Gmail
          </Button>
        )}
      </div>
    );
  }
  
  // The not-connected button - ensure onClick is called when button is clicked
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`flex items-center gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 ${className}`}
            onClick={onClick} // This ensures the connectGmail function is called on click
          >
            <AlertCircle className="h-4 w-4" />
            <span>Gmail Setup Required</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            Google API requires additional configuration. Click to connect your Gmail account.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
