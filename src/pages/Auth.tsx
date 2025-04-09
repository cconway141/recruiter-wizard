
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Custom Google icon component
const Google = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <path d="M17.24 14.32C16.24 17.36 13.28 19.26 9.98 18.87C7.2 18.54 4.93 16.47 4.36 13.75C3.63 10.17 5.91 6.79 9.39 5.91C11.19 5.46 12.89 5.73 14.33 6.6C14.96 7 15.5 7.57 16.03 8.14C15.38 8.78 14.76 9.41 14.12 10.05C13.58 9.53 12.95 9.07 12.2 8.86C10.33 8.32 8.3 9.36 7.64 11.17C6.94 13.08 7.89 15.29 9.74 16.08C11.61 16.96 13.98 16.15 14.9 14.24H12.32V11.95H17.28C17.38 12.74 17.41 13.54 17.24 14.32Z" />
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();

    // Check for hash fragment in URL (from Google redirect)
    const handleHashParams = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        // Let the Supabase client handle the token
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user from hash params:', error);
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive",
          });
        } else if (data.user) {
          toast({
            title: "Authentication successful",
            description: "You are now signed in!",
          });
          navigate('/');
        }
      }
    };
    
    handleHashParams();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Message Master</CardTitle>
          <CardDescription className="text-center">
            Sign in with Google to access the application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center gap-2" 
            variant="outline"
          >
            <Google />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
