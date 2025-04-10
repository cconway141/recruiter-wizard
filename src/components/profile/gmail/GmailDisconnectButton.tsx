
import React from "react";
import { Button } from "@/components/ui/button";

interface GmailDisconnectButtonProps {
  onDisconnect: () => Promise<void>;
  isLoading: boolean;
}

export const GmailDisconnectButton: React.FC<GmailDisconnectButtonProps> = ({
  onDisconnect,
  isLoading, // We'll keep this prop for compatibility but won't use it
}) => {
  return (
    <Button 
      variant="destructive" 
      onClick={onDisconnect}
      className="w-full mb-2"
    >
      Disconnect Gmail
    </Button>
  );
};
