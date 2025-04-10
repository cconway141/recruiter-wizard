
import { useGmailConnectionStatus } from "./useGmailConnectionStatus";
import { useGmailAuthFlow } from "./useGmailAuth";
import { useGmailDisconnect } from "./useGmailDisconnect";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailConnection = (props: UseGmailConnectionProps = {}) => {
  const { onConnectionChange } = props;
  
  // Combine the functionality from the split hooks
  const { 
    isConnected, 
    isLoading, 
    configError, 
    checkGmailConnection, 
    refreshGmailToken,
    forceRefresh
  } = useGmailConnectionStatus({ onConnectionChange });
  
  const { connectGmail } = useGmailAuthFlow({ onConnectionChange });
  
  const { disconnectGmail } = useGmailDisconnect({ onConnectionChange });
  
  return {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
