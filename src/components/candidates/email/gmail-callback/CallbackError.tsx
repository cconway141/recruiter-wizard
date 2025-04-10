
import React from "react";
import { XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CallbackErrorProps {
  error: string | null;
  urlParams: any;
  errorDetails: any;
  onReturn: () => void;
}

export const CallbackError: React.FC<CallbackErrorProps> = ({ 
  error, 
  urlParams, 
  errorDetails, 
  onReturn 
}) => (
  <div className="text-center">
    <XCircle className="w-8 h-8 mx-auto text-red-500" />
    <h2 className="text-xl font-semibold text-red-600">Connection Failed</h2>
    <p className="text-gray-500">{error}</p>
    
    {urlParams && (
      <Alert variant="default" className="mt-4 text-left">
        <Info className="h-4 w-4" />
        <AlertTitle>URL Parameters</AlertTitle>
        <AlertDescription className="text-xs">
          <pre className="whitespace-pre-wrap break-all mt-1 bg-slate-100 p-2 rounded">
            {JSON.stringify(urlParams, null, 2)}
          </pre>
        </AlertDescription>
      </Alert>
    )}
    
    {errorDetails && errorDetails.redirectUriUsed && (
      <Alert variant="destructive" className="mt-4 text-left">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Redirect URI Mismatch</AlertTitle>
        <AlertDescription className="text-xs">
          <p className="mb-2">The OAuth redirect URI doesn't match what's configured in Google Cloud Console.</p>
          <p className="font-semibold">URI used: <code className="bg-muted p-1 rounded break-all">{errorDetails.redirectUriUsed}</code></p>
          <p className="mt-2">Please ensure this exact URI is added to your OAuth client's authorized redirect URIs in Google Cloud Console.</p>
          
          {errorDetails.requestDetails && (
            <div className="mt-2 p-2 bg-black/10 rounded text-xs">
              <p className="font-bold">Request Details:</p>
              <pre className="whitespace-pre-wrap break-all mt-1">{JSON.stringify(errorDetails.requestDetails, null, 2)}</pre>
            </div>
          )}
          
          {errorDetails.details && errorDetails.details.error === "redirect_uri_mismatch" && (
            <div className="mt-2 p-2 bg-black/10 rounded text-xs">
              <p className="font-bold">Google API Error:</p>
              <pre className="whitespace-pre-wrap break-all mt-1">{JSON.stringify(errorDetails.details, null, 2)}</pre>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )}
    
    <Button 
      onClick={onReturn}
      className="mt-4 w-full"
    >
      Return to Profile
    </Button>
  </div>
);
