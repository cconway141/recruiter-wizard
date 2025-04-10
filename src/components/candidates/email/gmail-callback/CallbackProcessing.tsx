
import React from "react";
import { Loader2 } from "lucide-react";

export const CallbackProcessing: React.FC = () => (
  <div className="text-center">
    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
    <h2 className="text-xl font-semibold">Connecting Gmail API...</h2>
    <p className="text-gray-500">Please wait while we complete the connection process.</p>
  </div>
);
