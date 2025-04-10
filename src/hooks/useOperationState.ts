
import { useState, useCallback, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";

interface UseOperationStateOptions {
  id: string;
  showLoadingUI?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: Error | null) => void;
}

/**
 * Hook for managing operation states consistently including loading and errors
 */
export function useOperationState({
  id,
  showLoadingUI = true,
  onLoadingChange,
  onErrorChange,
}: UseOperationStateOptions) {
  const { startLoading, stopLoading, isLoading, registerSilentOperation } = useLoading();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Notify via callbacks when state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(localLoading);
    }
  }, [localLoading, onLoadingChange]);
  
  useEffect(() => {
    if (onErrorChange) {
      onErrorChange(error);
    }
  }, [error, onErrorChange]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Execute an operation with loading and error state management
  const executeOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: { silent?: boolean; clearErrorOnStart?: boolean } = {}
  ): Promise<T> => {
    const { silent = false, clearErrorOnStart = true } = options;
    
    try {
      // Update loading state
      if (!silent && showLoadingUI) {
        startLoading(id);
      }
      setLocalLoading(true);
      
      // Clear previous error if requested
      if (clearErrorOnStart) {
        setError(null);
      }
      
      // Execute the operation
      const result = await operation();
      return result;
    } catch (err) {
      // Set error state
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      // Always clean up loading state
      if (!silent && showLoadingUI) {
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
    error,
    clearError,
    executeOperation,
    executeSilentOperation,
    registerSilentOperation: () => registerSilentOperation(id),
  };
}
