
import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GmailRefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const GmailRefreshButton: React.FC<GmailRefreshButtonProps> = ({
  onRefresh,
  isLoading,
}) => {
  return (
    <Button 
      variant="ghost" 
      onClick={onRefresh}
      className="text-xs w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          Checking...
        </>
      ) : (
        "Refresh Connection Status"
      )}
    </Button>
  );
};
