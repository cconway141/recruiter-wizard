
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface JobErrorStateProps {
  error: string;
  navigate: NavigateFunction;
}

export const JobErrorState: React.FC<JobErrorStateProps> = ({ error, navigate }) => {
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
        </div>
        
        <div className="bg-destructive/10 p-6 rounded-lg text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </main>
    </div>
  );
};
