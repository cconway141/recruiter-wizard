import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // If we have hash parameters from OAuth redirect, process them first
        if (location.hash && location.hash.includes('access_token')) {
          setIsProcessingAuth(true);
          
          // Let Supabase process the hash parameters
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Error getting user from hash params:', error);
            toast({
              title: "Authentication failed",
              description: error.message,
              variant: "destructive"
            });
          } else if (data.user) {
            // Authentication successful, redirect to home page
            toast({
              title: "Authentication successful",
              description: "You are now signed in!"
            });
            
            // Clear the hash and navigate to home
            window.history.replaceState(null, document.title, window.location.pathname);
            navigate('/');
            return;
          }
        } else {
          // Otherwise check if user is already logged in
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            navigate("/");
            return;
          }
        }
      } catch (err) {
        console.error('Error in auth process:', err);
        toast({
          title: "Authentication error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsProcessingAuth(false);
      }
    };

    handleAuth();
  }, [navigate, location]);

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <img 
            src="/lovable-uploads/c52867a5-bcb6-4787-a1d0-6dafe3716176.png" 
            alt="Company Logo" 
            className="w-32 h-32 object-contain mb-4" 
          />
          <CardTitle className="text-2xl font-bold text-center">ITBC Recruitment Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in with Google to access this application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center flex-col items-center">
          {isProcessingAuth ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
              <span>Processing authentication...</span>
            </div>
          ) : (
            <>
              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full bg-blue-900 hover:bg-blue-950 text-white flex items-center justify-center gap-2" 
                variant="default"
              >
                Sign in with Google
              </Button>
              <img 
                src="/lovable-uploads/84c3c664-fba4-4005-985a-802a5ae8353d.png" 
                alt="Google Logo" 
                className="w-16 h-16 object-contain mt-4" 
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
