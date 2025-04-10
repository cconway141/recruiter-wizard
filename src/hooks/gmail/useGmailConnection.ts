
import { useCallback, useEffect } from "react";
import { useGmailConnectionStatus } from "./useGmailConnectionStatus";
import { useGmailAuthFlow } from "./useGmailAuth";
import { useGmailDisconnect } from "./useGmailDisconnect";
import { useLoadingOperation } from "@/hooks/useLoadingOperation";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  showLoadingUI?: boolean; // Replaces skipLoading with more explicit naming
}

export const useGmailConnection = (props: UseGmailConnectionProps = {}) => {
  const { onConnectionChange, showLoadingUI = true } = props;
  
  // Use our new loading operation hook instead of skipLoading
  const { 
    isLoading: isCheckingConnection,
    executeOperation,
    executeSilentOperation
  } = useLoadingOperation({ 
    id: "gmail-connection-check",
    showLoadingUI: showLoadingUI,
  });
  
  const { 
    isConnected, 
    configError, 
    checkGmailConnection: rawCheckConnection, 
    refreshGmailToken,
    forceRefresh
  } = useGmailConnectionStatus({ 
    onConnectionChange
  });
  
  const { connectGmail } = useGmailAuthFlow({ onConnectionChange });
  const { disconnectGmail: rawDisconnectGmail } = useGmailDisconnect({ onConnectionChange });

  // Wrap connection check with loading state management
  const checkGmailConnection = useCallback(async () => {
    return executeOperation(async () => {
      return rawCheckConnection();
    });
  }, [executeOperation, rawCheckConnection]);
  
  // Silently check connection status in the background without UI loading indicator
  const silentCheckConnection = useCallback(async () => {
    return executeSilentOperation(async () => {
      return rawCheckConnection();
    });
  }, [executeSilentOperation, rawCheckConnection]);
  
  // Wrap disconnect with loading state management
  const disconnectGmail = useCallback(async () => {
    return executeOperation(async () => {
      return rawDisconnectGmail();
    });
  }, [executeOperation, rawDisconnectGmail]);

  // Run a silent check on mount if enabled
  useEffect(() => {
    // Silently check connection in the background without UI indicators
    silentCheckConnection().catch(error => {
      console.error("Background Gmail connection check failed:", error);
    });
  }, [silentCheckConnection]);
  
  return {
    isConnected,
    isLoading: isCheckingConnection,
    configError,
    connectGmail,
    disconnectGmail,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh,
    silentCheckConnection
  };
};
