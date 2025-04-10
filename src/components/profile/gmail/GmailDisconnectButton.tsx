
import React from "react";
import { Button } from "@/components/ui/button";

interface GmailDisconnectButtonProps {
  onDisconnect: () => Promise<void>;
  isLoading?: boolean; // Make isLoading optional with a default value
}

export const GmailDisconnectButton: React.FC<GmailDisconnectButtonProps> = ({
  onDisconnect,
  isLoading = false, // Default value for isLoading
}) => {
  return (
    <Button 
      variant="destructive" 
      onClick={onDisconnect}
      className="w-full mb-2"
      disabled={isLoading}
    >
      {isLoading ? "Disconnecting..." : "Disconnect Gmail"}
    </Button>
  );
};
