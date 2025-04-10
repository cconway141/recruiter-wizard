
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Define types for our loading state context
type LoadingContextType = {
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  registerSilentOperation: (key: string) => Promise<void>;
};

// Create context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: () => false,
  startLoading: () => {},
  stopLoading: () => {},
  registerSilentOperation: async () => {},
});

// Provider component
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Track loading states for different operations using a Map
  const [loadingOperations, setLoadingOperations] = useState<Record<string, boolean>>({});

  // Check if a specific operation is loading
  const isLoading = useCallback((key: string) => {
    return !!loadingOperations[key];
  }, [loadingOperations]);

  // Start loading for a specific operation
  const startLoading = useCallback((key: string) => {
    setLoadingOperations(prev => ({ ...prev, [key]: true }));
  }, []);

  // Stop loading for a specific operation
  const stopLoading = useCallback((key: string) => {
    setLoadingOperations(prev => ({ ...prev, [key]: false }));
  }, []);

  // Register a "silent" operation (one that runs in the background without UI feedback)
  const registerSilentOperation = useCallback(async (key: string) => {
    // We still track it internally but don't display loading UI
    const silentKey = `silent:${key}`;
    setLoadingOperations(prev => ({ ...prev, [silentKey]: true }));
    
    // Return a promise that resolves when the operation is marked complete
    return new Promise<void>((resolve) => {
      // The operation will be marked complete externally
      const checkInterval = setInterval(() => {
        if (!loadingOperations[silentKey]) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }, [loadingOperations]);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      startLoading, 
      stopLoading,
      registerSilentOperation
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook for consuming the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
