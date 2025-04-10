
import { useGmailConnectionStatus } from "./useGmailConnectionStatus";
import { useGmailAuthFlow } from "./useGmailAuth";
import { useGmailDisconnect } from "./useGmailDisconnect";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  skipLoading?: boolean; // Prop to skip loading states
}

export const useGmailConnection = (props: UseGmailConnectionProps = {}) => {
  const { onConnectionChange, skipLoading = false } = props;
  
  // Pass skipLoading to prevent loading states from being exposed to UI
  const { 
    isConnected, 
    isLoading, 
    configError, 
    checkGmailConnection, 
    refreshGmailToken,
    forceRefresh
  } = useGmailConnectionStatus({ 
    onConnectionChange, 
    skipLoading // Critical flag: prevents loading state from affecting UI
  });
  
  const { connectGmail } = useGmailAuthFlow({ onConnectionChange });
  
  const { disconnectGmail } = useGmailDisconnect({ onConnectionChange });
  
  return {
    // When skipLoading is true, always hide loading state from components
    isConnected,
    isLoading: skipLoading ? false : isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
