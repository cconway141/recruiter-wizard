
import React from "react";
import { useGmailCallbackProcessor } from "./gmail-callback/useGmailCallbackProcessor";
import { CallbackProcessing } from "./gmail-callback/CallbackProcessing";
import { CallbackSuccess } from "./gmail-callback/CallbackSuccess";
import { CallbackError } from "./gmail-callback/CallbackError";

export const GmailCallback: React.FC = () => {
  const {
    status,
    error,
    errorDetails,
    urlParams,
    handleReturnToProfile
  } = useGmailCallbackProcessor();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow text-center">
        {status === 'processing' && <CallbackProcessing />}
        
        {status === 'success' && <CallbackSuccess />}
        
        {status === 'error' && (
          <CallbackError 
            error={error} 
            urlParams={urlParams} 
            errorDetails={errorDetails}
            onReturn={handleReturnToProfile}
          />
        )}
      </div>
    </div>
  );
};
