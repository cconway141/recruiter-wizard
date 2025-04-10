
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const GmailCallback: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleCallback = async () => {
      if (!user) {
        setError("You must be logged in to connect Gmail");
        setStatus('error');
        return;
      }

      try {
        // Parse the URL for code and state parameters
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");
        
        // If there's an error parameter, handle it
        const errorParam = params.get("error");
        if (errorParam) {
          console.error("OAuth error:", errorParam);
          setError(`OAuth error: ${errorParam}`);
          setStatus('error');
          
          // Store error for debugging
          sessionStorage.setItem('gmailConnectionError', JSON.stringify({
            message: `OAuth error: ${errorParam}`,
            timestamp: Date.now()
          }));
          return;
        }

        if (!code) {
          setError("No authorization code received from Google");
          setStatus('error');
          return;
        }

        if (!state) {
          setError("No state parameter received from Google");
          setStatus('error');
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
            const { data, error } = await supabase.functions.invoke('google-auth/exchange-code', {
              body: { code, state }
            });

            if (error) {
              console.error(`Attempt ${retryCount + 1}: Error exchanging code:`, error);
              throw error;
            }

            if (data?.error === 'Configuration error') {
              setError(data.message || 'Google OAuth is not properly configured');
              setStatus('error');
              return;
            }
            
            // If we received error details about redirect URI mismatch
            if (data?.error && data?.redirectUriUsed) {
              setErrorDetails({ 
                error: data.error,
                redirectUriUsed: data.redirectUriUsed,
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
            const { data: checkData } = await supabase.functions.invoke('google-auth/check-connection', {
              body: { userId: user.id }
            });
            
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
          
          // Store error for debugging
          sessionStorage.setItem('gmailConnectionError', JSON.stringify({
            message: `Failed to exchange code after ${maxRetries} attempts`,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error("Error processing callback:", err);
        setError("An unexpected error occurred while connecting Gmail");
        setStatus('error');
        
        // Store error for debugging
        sessionStorage.setItem('gmailConnectionError', JSON.stringify({
          message: err.message,
          timestamp: Date.now()
        }));
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate, user, toast, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
            <h2 className="text-xl font-semibold">Connecting Gmail API...</h2>
            <p className="text-gray-500">Please wait while we complete the connection process.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
            <h2 className="text-xl font-semibold text-green-600">Gmail API Connected!</h2>
            <p className="text-gray-500">You will be redirected to your profile in a moment.</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-8 h-8 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold text-red-600">Connection Failed</h2>
            <p className="text-gray-500">{error}</p>
            
            {errorDetails && errorDetails.redirectUriUsed && (
              <Alert variant="destructive" className="mt-4 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Redirect URI Mismatch</AlertTitle>
                <AlertDescription className="text-xs">
                  <p className="mb-2">The OAuth redirect URI doesn't match what's configured in Google Cloud Console.</p>
                  <p className="font-semibold">URI used: <code className="bg-muted p-1 rounded break-all">{errorDetails.redirectUriUsed}</code></p>
                  <p className="mt-2">Please ensure this exact URI is added to your OAuth client's authorized redirect URIs in Google Cloud Console.</p>
                  
                  {errorDetails.details && errorDetails.details.error === "redirect_uri_mismatch" && (
                    <div className="mt-2 p-2 bg-black/10 rounded text-xs">
                      <p className="font-bold">Google API Error:</p>
                      <pre className="whitespace-pre-wrap break-all mt-1">{JSON.stringify(errorDetails.details, null, 2)}</pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={() => navigate("/profile")}
              className="mt-4 w-full"
            >
              Return to Profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
