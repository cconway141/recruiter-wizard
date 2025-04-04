import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AirtableSetup } from "@/components/settings/AirtableSetup";
import { supabase } from "@/integrations/supabase/client";
import { useJobs } from "@/contexts/JobContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsManager } from "@/components/settings/clients/ClientsManager";
import { LocalesManager } from "@/components/settings/LocalesManager";
import { FlavorsManager } from "@/components/settings/FlavorsManager";
import { StatusesManager } from "@/components/settings/StatusesManager";
import { useQueryClient } from "@tanstack/react-query";

const Settings = () => {
  const { isAirtableEnabled } = useJobs();
  const [activeTab, setActiveTab] = useState("clients");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Force a re-render when the component mounts to ensure data is refreshed
    const refreshData = async () => {
      // Invalidate query cache to force a refresh
      console.log("Settings page mounted, refreshing data...");
      queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
    };
    
    refreshData();
  }, [queryClient]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader title="Settings" description="Configure application settings and integrations." />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="locales">Locales</TabsTrigger>
            <TabsTrigger value="flavors">Flavors</TabsTrigger>
            <TabsTrigger value="statuses">Job Statuses</TabsTrigger>
            {isAirtableEnabled && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="clients">
            <ClientsManager />
          </TabsContent>

          <TabsContent value="locales">
            <LocalesManager />
          </TabsContent>

          <TabsContent value="flavors">
            <FlavorsManager />
          </TabsContent>

          <TabsContent value="statuses">
            <StatusesManager />
          </TabsContent>

          {isAirtableEnabled && (
            <TabsContent value="integrations">
              <AirtableSetup />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
