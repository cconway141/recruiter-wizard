
import { useState, useCallback, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";

interface UseLoadingOperationOptions {
  id: string;
  showLoadingUI?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * Hook for managing operation loading states consistently
 * Replaces skipLoading pattern with a more explicit approach
 */
export function useLoadingOperation({
  id,
  showLoadingUI = true,
  onLoadingChange,
}: UseLoadingOperationOptions) {
  const { startLoading, stopLoading, isLoading, registerSilentOperation } = useLoading();
  const [localLoading, setLocalLoading] = useState(false);
  
  // When local loading state changes, notify via callback if provided
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(localLoading);
    }
  }, [localLoading, onLoadingChange]);

  // Execute an operation with loading state management
  const executeOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: { silent?: boolean } = {}
  ): Promise<T> => {
    try {
      // Update loading state
      if (!options.silent && showLoadingUI) {
        startLoading(id);
      }
      setLocalLoading(true);
      
      // Execute the operation
      const result = await operation();
      return result;
    } finally {
      // Always clean up loading state
      if (!options.silent && showLoadingUI) {
        stopLoading(id);
      }
      setLocalLoading(false);
    }
  }, [id, showLoadingUI, startLoading, stopLoading]);

  // Run a silent background operation
  const executeSilentOperation = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    return executeOperation(operation, { silent: true });
  }, [executeOperation]);

  return {
    isLoading: showLoadingUI ? isLoading(id) : localLoading,
    executeOperation,
    executeSilentOperation,
    registerSilentOperation: () => registerSilentOperation(id),
  };
}
