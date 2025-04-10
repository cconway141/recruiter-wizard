
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GmailCallback: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      if (!user) {
        setError("You must be logged in to connect Gmail");
        return;
      }

      try {
        // Parse the URL for code and state parameters
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          setError("No authorization code received from Google");
          return;
        }

        if (!state) {
          setError("No state parameter received from Google");
          return;
        }

        // Exchange the code for tokens
        const { data, error } = await supabase.functions.invoke('google-auth/exchange-code', {
          body: { code, state }
        });

        if (error) {
          console.error("Error exchanging code for tokens:", error);
          setError(`Failed to connect Gmail: ${error.message}`);
          return;
        }

        toast({
          title: "Success",
          description: "Gmail connected successfully.",
        });

        // Redirect back to the application
        navigate("/");
      } catch (err) {
        console.error("Error processing callback:", err);
        setError("An unexpected error occurred while connecting Gmail");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate, user, toast]);

  // Display a loading state while processing
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-recruiter-primary" />
          <h2 className="text-xl font-semibold">Connecting Gmail...</h2>
          <p className="text-gray-500">Please wait while we complete the connection process.</p>
        </div>
      </div>
    );
  }

  // Display an error if one occurred
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600">Connection Failed</h2>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-recruiter-primary text-white rounded hover:bg-recruiter-secondary transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // This shouldn't normally be shown as we redirect after successful processing
  return null;
};
