
import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Jobs = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex justify-between items-center mb-8">
          <PageHeader 
            title="Jobs" 
            description="Manage and track your job listings"
          />
          <Button 
            onClick={() => navigate("/add-job")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Job
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p>Jobs listing will appear here</p>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
