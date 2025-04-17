
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Dashboard" 
          description="Welcome to the IT Bootcamp Recruiter Portal"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => navigate('/jobs')}>
            <h3 className="text-lg font-medium">Jobs</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Manage and track your job listings
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => navigate('/candidates')}>
            <h3 className="text-lg font-medium">Candidates</h3>
            <p className="text-sm text-muted-foreground mt-2">
              View and manage job candidates
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => navigate('/profile')}>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your account and settings
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => navigate("/jobs/add")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
