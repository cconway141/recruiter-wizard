
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
  const [imagesLoaded, setImagesLoaded] = useState({
    logo: false,
    googleIcon: false
  });
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("Current URL:", window.location.href);
    console.log("Location object:", location);
    console.log("Origin:", window.location.origin);
  }, [location]);
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        setIsProcessingAuth(true);
        
        // Check for access_token in URL hash
        if (location.hash && location.hash.includes('access_token')) {
          console.log("Found access_token in URL hash, attempting to process");
          
          // Let Supabase handle the auth tokens from hash
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session from hash params:', sessionError);
            toast({
              title: "Authentication failed",
              description: sessionError.message,
              variant: "destructive"
            });
          } else if (sessionData.session) {
            console.log("Successfully processed hash, user is authenticated");
            
            // Clean up the URL by removing the hash
            window.history.replaceState(null, document.title, window.location.pathname);
            
            // Authentication successful, redirect to home page
            toast({
              title: "Authentication successful",
              description: "You are now signed in!"
            });
            
            navigate('/');
            return;
          } else {
            console.log("No session found after processing hash");
          }
        }
        
        // If there's no hash or hash processing didn't result in a session,
        // check if the user is already logged in
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("User already has a valid session");
          navigate("/");
          return;
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
      // Get current URL for the redirect - use the actual production URL if available
      // This is crucial for proper redirection after Google auth
      let redirectTo = "";
      
      // First check if we're on our production domain
      if (window.location.hostname === "recruit.theitbootcamp.com") {
        redirectTo = "https://recruit.theitbootcamp.com/auth/callback";
      } else {
        // Fallback to current origin (will handle Lovable preview URLs)
        redirectTo = `${window.location.origin}/auth/callback`;
      }
      
      console.log("Redirecting to Google with callback URL:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error("Google sign in error:", error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log("Redirecting to Google OAuth...");
      }
    } catch (error: any) {
      console.error("Error initiating Google sign in:", error);
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleImageLoad = (imageType: 'logo' | 'googleIcon') => {
    setImagesLoaded(prev => ({
      ...prev,
      [imageType]: true
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-32 h-32 flex items-center justify-center overflow-hidden transition-opacity duration-300" 
               style={{ opacity: imagesLoaded.logo ? 1 : 0.7 }}>
            <img 
              src="/lovable-uploads/c52867a5-bcb6-4787-a1d0-6dafe3716176.png" 
              alt="Company Logo" 
              className="w-32 h-32 object-contain"
              loading="lazy"
              onLoad={() => handleImageLoad('logo')}
            />
          </div>
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
              <div className="w-16 h-16 flex items-center justify-center overflow-hidden transition-opacity duration-300 mt-4"
                   style={{ opacity: imagesLoaded.googleIcon ? 1 : 0.7 }}>
                <img 
                  src="/lovable-uploads/84c3c664-fba4-4005-985a-802a5ae8353d.png" 
                  alt="Google Logo" 
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                  onLoad={() => handleImageLoad('googleIcon')}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
