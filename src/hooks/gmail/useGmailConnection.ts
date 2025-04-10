
import { useGmailConnectionStatus } from "./useGmailConnectionStatus";
import { useGmailAuthFlow } from "./useGmailAuth";
import { useGmailDisconnect } from "./useGmailDisconnect";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  skipLoading?: boolean; // New prop to skip loading states
}

export const useGmailConnection = (props: UseGmailConnectionProps = {}) => {
  const { onConnectionChange, skipLoading = false } = props;
  
  // Combine the functionality from the split hooks
  const { 
    isConnected, 
    isLoading, 
    configError, 
    checkGmailConnection, 
    refreshGmailToken,
    forceRefresh
  } = useGmailConnectionStatus({ onConnectionChange, skipLoading });
  
  const { connectGmail } = useGmailAuthFlow({ onConnectionChange });
  
  const { disconnectGmail } = useGmailDisconnect({ onConnectionChange });
  
  return {
    isConnected,
    isLoading: skipLoading ? false : isLoading, // Force isLoading to false if skipLoading is true
    configError,
    connectGmail,
    disconnectGmail,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
