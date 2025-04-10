
import React from "react";
import { CheckCircle } from "lucide-react";

export const CallbackSuccess: React.FC = () => (
  <div className="text-center">
    <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
    <h2 className="text-xl font-semibold text-green-600">Gmail API Connected!</h2>
    <p className="text-gray-500">You will be redirected to your profile in a moment.</p>
  </div>
);
