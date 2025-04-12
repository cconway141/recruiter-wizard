
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface JobLoadingStateProps {
  navigate: NavigateFunction;
  showHeaderAndNav?: boolean;
}

export const JobLoadingState: React.FC<JobLoadingStateProps> = ({ 
  navigate, 
  showHeaderAndNav = true 
}) => {
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <svg className="h-8 w-8 animate-spin mx-auto text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500">{showHeaderAndNav ? "Loading job data..." : "Initializing form..."}</p>
      </div>
    </div>
  );

  if (!showHeaderAndNav) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <PageHeader 
            title="Loading Job..." 
            description="Please wait while we retrieve the job details."
          />
        </div>
        <LoadingSpinner />
      </main>
    </div>
  );
};
