
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const GmailCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGmailCallback = async () => {
      try {
        console.log("Handling Gmail callback with URL:", window.location.href);
        
        // Get the URL params
        const { search, hash } = location;
        const params = new URLSearchParams(search || hash.substring(1));
        
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        
        if (errorParam) {
          throw new Error(`Error returned from Google: ${errorParam}`);
        }
        
        if (!code || !state) {
          throw new Error("Missing required parameters (code or state)");
        }
        
        console.log("Code and state found, exchanging for tokens");
        
        // Exchange the code for tokens
        const { data, error } = await supabase.functions.invoke('google-auth/exchange-code', {
          body: { 
            code,
            state
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }
        
        toast({
          title: "Gmail Connected",
          description: "Your Gmail account has been successfully connected for sending emails."
        });
        
        // Navigate back to profile
        navigate('/profile');
      } catch (err: any) {
        console.error("Error in Gmail callback:", err);
        setError(err.message || "Failed to connect Gmail");
        toast({
          title: "Failed to Connect Gmail",
          description: err.message || "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    handleGmailCallback();
  }, [location, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Connecting your Gmail account...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Gmail Connection Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => navigate('/profile')}
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};
