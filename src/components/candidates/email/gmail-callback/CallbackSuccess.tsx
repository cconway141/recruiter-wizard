
import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface CallbackSuccessProps {
  redirectDelay?: number;
}

export const CallbackSuccess: React.FC<CallbackSuccessProps> = ({ 
  redirectDelay = 3000 
}) => {
  useEffect(() => {
    // Set up redirection after a delay
    const redirectTimer = setTimeout(() => {
      // Redirect to profile page with success parameter
      window.location.href = `${window.location.origin}/profile?gmail_connected=true`;
    }, redirectDelay);
    
    return () => clearTimeout(redirectTimer);
  }, [redirectDelay]);

  return (
    <div className="text-center">
      <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
      <h2 className="text-xl font-semibold text-green-600">Gmail API Connected!</h2>
      <p className="text-gray-500">You will be redirected to your profile in a moment.</p>
    </div>
  );
};
