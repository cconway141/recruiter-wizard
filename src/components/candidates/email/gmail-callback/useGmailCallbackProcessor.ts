
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
        console.log("Decoded state:", atob(state));
        console.log("Exchanging code for Gmail API access tokens...");
        
        // Exchange the code for tokens with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let success = false;
        
        while (retryCount < maxRetries && !success) {
          try {
            const { data, error } = await supabase.functions.invoke('google-auth', {
              body: { action: 'exchange-code', code, state }
            });

            if (error) {
              console.error(`Attempt ${retryCount + 1}: Error exchanging code:`, error);
              throw error;
            }

            if (data?.error === 'Configuration error') {
              setError(data.message || 'Google OAuth is not properly configured');
              setStatus('error');
              setIsProcessing(false);
              return;
            }
            
            // If we received error details about redirect URI mismatch
            if (data?.error && (data?.redirectUriUsed || data?.requestDetails)) {
              setErrorDetails({ 
                error: data.error,
                redirectUriUsed: data.redirectUriUsed,
                requestDetails: data.requestDetails,
                details: data.details 
              });
              throw new Error(`Failed to exchange code: ${data.error}`);
            }
            
            console.log(`Attempt ${retryCount + 1}: Token exchange successful:`, data);
            success = true;
            
            // Force immediate refresh of all Gmail connection queries
            queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
            queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
            
            // Mark a successful connection in sessionStorage for UI feedback
            sessionStorage.setItem('gmailConnectionSuccess', 'true');
            sessionStorage.setItem('gmailConnectionTimestamp', Date.now().toString());
            
            // Verify the tokens were saved by checking the connection
            console.log("Verifying connection after token exchange...");
            const { data: checkData, error: checkError } = await supabase.functions.invoke('google-auth', {
              body: { action: 'check-connection', userId: user.id }
            });
            
            if (checkError) {
              console.error("Error verifying connection:", checkError);
              throw new Error("Failed to verify connection after token exchange");
            }
            
            console.log("Connection verification:", checkData);
            
            if (!checkData.connected) {
              console.error("Token saved but connection check failed");
              throw new Error("Failed to verify Gmail connection after saving tokens");
            }
            
            setStatus('success');
            
            toast({
              title: "Gmail Connected",
              description: "Your Gmail account has been successfully connected for sending emails.",
            });

            // Wait a moment before redirecting to ensure tokens are saved
            setTimeout(() => {
              navigate("/profile");
            }, 2000);
            
            return;
          } catch (retryError) {
            console.error(`Attempt ${retryCount + 1} failed:`, retryError);
            retryCount++;
            
            if (retryCount < maxRetries) {
              console.log(`Retrying in 1 second... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!success) {
          setError(`Failed to exchange code after ${maxRetries} attempts`);
          setStatus('error');
          setIsProcessing(false);
          
          // Store error for debugging
          sessionStorage.setItem('gmailConnectionError', JSON.stringify({
            message: `Failed to exchange code after ${maxRetries} attempts`,
            timestamp: Date.now(),
            params: paramObj
          }));
        }
      } catch (err: any) {
        console.error("Error processing callback:", err);
        setError("An unexpected error occurred while connecting Gmail");
        setStatus('error');
        setIsProcessing(false);
        
        // Store error for debugging
        sessionStorage.setItem('gmailConnectionError', JSON.stringify({
          message: err.message,
          timestamp: Date.now(),
          params: paramObj
        }));
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [location, navigate, user, toast, queryClient]);

  return {
    isProcessing,
    status,
    error,
    errorDetails,
    urlParams,
    handleReturnToProfile
  };
};
