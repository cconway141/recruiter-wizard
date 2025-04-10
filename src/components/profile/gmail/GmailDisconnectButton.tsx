
import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GmailDisconnectButtonProps {
  onDisconnect: () => Promise<void>;
  isLoading: boolean;
}

export const GmailDisconnectButton: React.FC<GmailDisconnectButtonProps> = ({
  onDisconnect,
  isLoading,
}) => {
  return (
    <Button 
      variant="destructive" 
      onClick={onDisconnect}
      className="w-full mb-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          Checking...
        </>
      ) : (
        "Disconnect Gmail"
      )}
    </Button>
  );
};
