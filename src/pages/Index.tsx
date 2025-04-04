
import { PageHeader } from "@/components/layout/PageHeader";
import { JobsFilter } from "@/components/jobs/JobsFilter";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Navbar } from "@/components/layout/Navbar";
import { AirtableSetup } from "@/components/settings/AirtableSetup";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { isAirtableEnabled, syncWithAirtable } = useJobs();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    await syncWithAirtable();
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <PageHeader 
            title="Job Dashboard" 
            description="Manage and track recruiter jobs in one place. Create personalized messages for LinkedIn outreach."
          />
          <div className="flex items-center gap-3">
            {isAirtableEnabled && (
              <Button 
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? "Syncing..." : "Sync with Airtable"}
              </Button>
            )}
            <AirtableSetup />
          </div>
        </div>
        <JobsFilter />
        <JobsTable />
      </main>
    </div>
  );
};

export default Index;
