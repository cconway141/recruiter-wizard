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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";

const Settings = () => {
  const { isAirtableEnabled } = useJobs();
  const [activeTab, setActiveTab] = useState<string>("clients");
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...");
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [dbDetails, setDbDetails] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Verify connection to Supabase
    const checkConnection = async () => {
      try {
        console.log("Settings: Checking Supabase connection...");
        
        // First check basic connectivity
        const { data, error } = await supabase.from('clients').select('count');
        
        if (error) {
          console.error("Settings: Supabase connection error:", error);
          setConnectionStatus(`Error: ${error.message}`);
          return;
        }
        
        console.log("Settings: Supabase connection successful, count data:", data);
        setConnectionStatus("Connected to Supabase successfully");

        // Try to get list of tables in public schema (helps debugging)
        try {
          const { data: tablesData, error: tablesError } = await supabase
            .rpc('get_public_tables');
          
          if (tablesError) {
            if (tablesError.code === '42883') {
              // This is fine - the function doesn't exist yet
              console.log("Settings: get_public_tables function doesn't exist, this is expected");
            } else {
              console.error("Settings: Error getting tables list:", tablesError);
            }
          } else if (tablesData) {
            console.log("Settings: Public tables:", tablesData);
            setDbTables(tablesData as string[]);
          }
          
          // Get more details about clients table specifically
          const { data: clientsInfo, error: clientsInfoError } = await supabase
            .rpc('get_table_details', { table_name: 'clients' });
          
          if (clientsInfoError) {
            if (clientsInfoError.code === '42883') {
              // This is fine - the function doesn't exist yet
              console.log("Settings: get_table_details function doesn't exist, this is expected");
            } else {
              console.error("Settings: Error getting clients table info:", clientsInfoError);
            }
          } else if (clientsInfo) {
            console.log("Settings: Clients table details:", clientsInfo);
            setDbDetails(clientsInfo);
          }
        } catch (e) {
          console.error("Settings: Error checking database metadata:", e);
        }
      } catch (error) {
        console.error("Settings: Error checking Supabase connection:", error);
        setConnectionStatus("Failed to connect to Supabase");
      }
    };
    
    checkConnection();
    
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
        
        {/* Enhanced connection status with debug info */}
        <Accordion type="single" collapsible className="mb-6 w-full">
          <AccordionItem value="connection-info">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center text-left">
                <Info className="h-4 w-4 mr-2" />
                Supabase connection: {connectionStatus.includes("Error") ? 
                  <span className="text-red-500 ml-2">{connectionStatus}</span> : 
                  <span className="text-green-500 ml-2">{connectionStatus}</span>}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-xs text-muted-foreground space-y-2 p-2 bg-muted/50 rounded-md">
                <p>Connection URL: {import.meta.env.VITE_SUPABASE_URL || "https://evggwokrvotnnkazteia.supabase.co"}</p>
                <details>
                  <summary className="cursor-pointer">Available Tables</summary>
                  <pre className="overflow-auto mt-2 p-2 bg-muted rounded-md">
                    {dbTables.length ? dbTables.join(', ') : 'No tables info available'}
                  </pre>
                </details>
                <details>
                  <summary className="cursor-pointer">Clients Table Details</summary>
                  <pre className="overflow-auto mt-2 p-2 bg-muted rounded-md">
                    {JSON.stringify(dbDetails, null, 2) || 'No details available'}
                  </pre>
                </details>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
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
