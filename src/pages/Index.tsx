
import { PageHeader } from "@/components/layout/PageHeader";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const location = useLocation();
  const { loadFromSupabase } = useJobs();
  const refreshingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Clear any hanging form states when returning to the home page
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset any hanging submission states in session storage
      const isSubmittingKey = 'job_form_submitting';
      if (sessionStorage.getItem(isSubmittingKey) === 'true') {
        console.log("Found a hanging submission state, clearing it");
        sessionStorage.removeItem(isSubmittingKey);
        toast({
          title: "Form State Reset",
          description: "A previous form submission may have been interrupted. Form state has been reset.",
        });
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [location.key]);
  
  // Refresh data when navigating to the home page
  useEffect(() => {
    const refreshData = async () => {
      // Prevent multiple simultaneous refresh calls
      if (refreshingRef.current) return;
      
      try {
        refreshingRef.current = true;
        console.log("Refreshing job dashboard data...");
        await loadFromSupabase();
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        refreshingRef.current = false;
        setIsInitialized(true);
      }
    };
    
    refreshData();
  }, [location.key, loadFromSupabase]);

  if (!isInitialized) {
    return null; // Don't render anything until initial data is loaded
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <PageHeader 
            title="Job Dashboard" 
            description="Manage and track recruiter jobs in one place. Create personalized messages for LinkedIn outreach."
          />
        </div>
        <JobsFilter />
        <JobsTable />
      </main>
    </div>
  );
};

export default Index;
