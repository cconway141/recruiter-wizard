
import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CallbackSuccessProps {
  redirectDelay?: number;
}

export const CallbackSuccess: React.FC<CallbackSuccessProps> = ({ 
  redirectDelay = 3000 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up redirection after a delay
    const redirectTimer = setTimeout(() => {
      // Use navigation to avoid page refresh
      navigate('/profile?gmail_connected=true');
    }, redirectDelay);
    
    return () => clearTimeout(redirectTimer);
  }, [redirectDelay, navigate]);

  return (
    <div className="text-center">
      <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
      <h2 className="text-xl font-semibold text-green-600">Gmail API Connected!</h2>
      <p className="text-gray-500">You will be redirected to your profile in a moment.</p>
    </div>
  );
};
