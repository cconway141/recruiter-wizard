
import React from "react";
import { Button } from "@/components/ui/button";
import { ConfigErrorButton } from "./ConfigErrorButton";
import { GmailButtonContent } from "./GmailButtonContent";
import { useGmailConnection } from "@/hooks/useGmailConnection";

interface GmailConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
  variant?: "default" | "refresh";
}

export const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({ 
  onConnectionChange,
  className = "",
  variant = "default"
}) => {
  const {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    forceRefresh
  } = useGmailConnection({ onConnectionChange });
  
  if (configError) {
    return <ConfigErrorButton className={className} />;
  }
  
  // Handle refresh button variant
  if (variant === "refresh") {
    return (
      <Button
        type="button"
        variant="ghost"
        className={`flex items-center gap-2 text-xs ${className}`}
        onClick={forceRefresh}
        disabled={isLoading}
      >
        <GmailButtonContent
          isConnected={isConnected}
          isLoading={isLoading}
          variant="refresh"
        />
      </Button>
    );
  }
  
  // Default button for connection/disconnection
  return (
    <Button
      type="button"
      variant={isConnected ? "default" : "outline"}
      className={`flex items-center gap-2 ${className}`}
      onClick={isConnected ? disconnectGmail : connectGmail}
      disabled={isLoading}
    >
      <GmailButtonContent
        isConnected={isConnected}
        isLoading={isLoading}
        variant={isConnected ? "connected" : "connect"}
      />
    </Button>
  );
};
