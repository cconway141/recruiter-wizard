
import React, { useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CallbackSuccessProps {
  redirectDelay?: number;
}

export const CallbackSuccess: React.FC<CallbackSuccessProps> = ({ 
  redirectDelay = 3000 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any connection progress flags
    try {
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
    } catch (error) {
      console.error("Error clearing session storage:", error);
    }
    
    // Set up redirection after a delay
    const redirectTimer = setTimeout(() => {
      try {
        console.log("Gmail connection successful, redirecting to profile page");
        // Use navigation to avoid page refresh
        navigate('/profile?gmail_connected=true');
      } catch (error) {
        console.error("Error during navigation:", error);
        // Fallback to window location if navigation fails
        window.location.href = '/profile?gmail_connected=true';
      }
    }, redirectDelay);
    
    return () => clearTimeout(redirectTimer);
  }, [redirectDelay, navigate]);

  return (
    <div className="text-center space-y-4">
      <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
      <h2 className="text-xl font-semibold text-green-600">Gmail API Connected!</h2>
      <p className="text-gray-500">You will be redirected to your profile in a moment.</p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting...
      </div>
    </div>
  );
};
