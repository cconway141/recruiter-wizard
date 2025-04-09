import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    checkSession();

    // Check for hash fragment in URL (from Google redirect)
    const handleHashParams = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        // Let the Supabase client handle the token
        const {
          data,
          error
        } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user from hash params:', error);
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive"
          });
        } else if (data.user) {
          toast({
            title: "Authentication successful",
            description: "You are now signed in!"
          });
          navigate('/');
        }
      }
    };
    handleHashParams();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  return <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <img 
            src="/lovable-uploads/4add4393-d8ec-4a30-970d-3bc3ad2bcd83.png" 
            alt="The IT Bootcamp Logo" 
            className="w-32 h-32 object-contain mb-4" 
          />
          <CardTitle className="text-2xl font-bold text-center">ITBC Recruitment Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in with Google to access this application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center flex-col items-center">
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
        </CardContent>
      </Card>
    </div>;
};
export default Auth;
