
import { useGmailConnectionStatus } from "./useGmailConnectionStatus";
import { useGmailAuthFlow } from "./useGmailAuth";
import { useGmailDisconnect } from "./useGmailDisconnect";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  skipLoading?: boolean; // Prop to skip loading states
}

export const useGmailConnection = (props: UseGmailConnectionProps = {}) => {
  const { onConnectionChange, skipLoading = false } = props;
  
  // Combine the functionality from the split hooks
  // Pass skipLoading to prevent loading states from being exposed
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
    // When skipLoading is true, always return false for isLoading to prevent UI blocking
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
