
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useGmailCallbackProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [urlParams, setUrlParams] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleReturnToProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const processCallback = async () => {
      // Capture URL parameters for debugging
      const params = new URLSearchParams(location.search);
      const paramObj: {[key: string]: string} = {};
      
      // Convert params to object for display
      params.forEach((value, key) => {
        paramObj[key] = value;
      });
      
      setUrlParams(paramObj);
      console.log("Callback URL parameters:", paramObj);
      
      if (!user) {
        setError("You must be logged in to connect Gmail");
        setStatus('error');
        setIsProcessing(false);
        return;
      }

      try {
        // Parse the URL for code and state parameters
        const code = params.get("code");
        const state = params.get("state");
        
        // If there's an error parameter, handle it
        const errorParam = params.get("error");
        if (errorParam) {
          console.error("OAuth error:", errorParam);
          setError(`OAuth error: ${errorParam}`);
          setStatus('error');
          setIsProcessing(false);
          
          // Store error for debugging
          sessionStorage.setItem('gmailConnectionError', JSON.stringify({
            message: `OAuth error: ${errorParam}`,
            timestamp: Date.now(),
            params: paramObj
          }));
          return;
        }

        if (!code) {
          setError("No authorization code received from Google");
          setStatus('error');
          setIsProcessing(false);
          return;
        }

        if (!state) {
          setError("No state parameter received from Google");
          setStatus('error');
          setIsProcessing(false);
          return;
        }

        console.log("Received code and state from Google OAuth flow");
        
        try {
          // Try to decode state to ensure it's valid
          const decodedState = JSON.parse(atob(state));
          console.log("Decoded state:", decodedState);
          
          // Validate state to prevent CSRF attacks
          if (!decodedState.userId || !decodedState.timestamp) {
            throw new Error("Invalid state parameter");
          }
          
          // Check if state is expired (10 minutes)
          if (Date.now() - decodedState.timestamp > 10 * 60 * 1000) {
            throw new Error("Authorization request expired");
          }
        } catch (stateError) {
          console.error("Error validating state:", stateError);
          setError("Invalid state parameter in callback");
          setStatus('error');
          setIsProcessing(false);
          return;
        }
        
        console.log("Exchanging code for Gmail API access tokens...");
        
        // Exchange the code for tokens with improved error handling
        const { data, error } = await supabase.functions.invoke('google-auth', {
          body: { action: 'exchange-code', code, state }
        });

        if (error) {
          console.error("Error exchanging code:", error);
          setError(`Failed to exchange authorization code: ${error.message}`);
          setStatus('error');
          setIsProcessing(false);
          return;
        }

        if (data?.error) {
          console.error("Error in token exchange:", data.error);
          
          // Capture detailed error information
          if (data.redirectUriUsed || data.requestDetails) {
            setErrorDetails({ 
              error: data.error,
              redirectUriUsed: data.redirectUriUsed,
              requestDetails: data.requestDetails,
              details: data.details 
            });
          }
          
          setError(`Failed to complete Gmail connection: ${data.error}`);
          setStatus('error');
          setIsProcessing(false);
          return;
        }

        console.log("Token exchange successful:", data);
        
        // Force immediate refresh of all Gmail connection queries
        queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        
        // Update connection status in all storage mechanisms
        sessionStorage.setItem('gmail_connection_status', 'true');
        sessionStorage.setItem('gmail_connection_timestamp', Date.now().toString());
        localStorage.setItem('gmail_connected', 'true');
        
        // Clean up connection attempt flags
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        
        setStatus('success');
        
        toast({
          title: "Gmail Connected",
          description: "Your Gmail account has been successfully connected for sending emails.",
        });

        // Give user a moment to see success message before redirecting
        setTimeout(() => {
          navigate("/profile", { 
            state: { gmailConnected: true }
          });
        }, 2000);
        
      } catch (error) {
        console.error("Error in Gmail callback processor:", error);
        
        // Comprehensive error message
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to complete the Gmail connection process";
        
        setError(errorMessage);
        setStatus('error');
        
        // Clean up connection attempt flags
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [location.search, user, navigate, toast, queryClient]);

  return {
    status,
    error,
    errorDetails,
    urlParams,
    handleReturnToProfile
  };
};
