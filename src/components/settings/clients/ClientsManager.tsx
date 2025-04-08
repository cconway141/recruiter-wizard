
import { useState, useEffect } from "react";
import { Client } from "./types";
import { ClientForm } from "./ClientForm";
import { ClientsList } from "./ClientsList";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Unknown");
  const [lastError, setLastError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const queryClient = useQueryClient();

  // First, check if we can connect to Supabase and the clients table exists
  const checkConnection = async () => {
    try {
      console.log("ClientsManager: Checking Supabase connection...");
      setConnectionStatus("Checking...");
      
      // First test basic connection
      const { data: countData, error: countError } = await supabase
        .from("clients")
        .select("count");
      
      if (countError) {
        console.error("ClientsManager: Connection error:", countError);
        setConnectionStatus(`Error: ${countError.message}`);
        setLastError(countError.message);
        throw countError;
      }
      
      console.log("ClientsManager: Connection successful, count data:", countData);
      setConnectionStatus("Connected");
      
      // Get table info to help with debugging
      const { data: tableData, error: tableError } = await supabase
        .rpc('get_clients_table_info');
      
      if (tableError) {
        if (tableError.code === '42883') {
          console.log("ClientsManager: get_clients_table_info function doesn't exist, this is expected");
          // This is fine - the function doesn't exist yet
          setTableInfo({ note: "Table info function doesn't exist yet" });
        } else {
          console.error("ClientsManager: Error getting table info:", tableError);
        }
      } else if (tableData) {
        console.log("ClientsManager: Table info:", tableData);
        setTableInfo(tableData);
      }
    } catch (error) {
      console.error("ClientsManager: Error checking connection:", error);
      setConnectionStatus("Failed to connect");
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      console.log("ClientsManager: Attempting to fetch clients from Supabase...");
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order('name');
      
      if (error) {
        console.error("ClientsManager: Error fetching clients:", error);
        setLastError(error.message);
        toast({
          title: "Error fetching clients",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("ClientsManager: Raw data received:", data);
      console.log("ClientsManager: Data length:", data?.length || 0);
      
      if (data) {
        setClients(data as Client[]);
        console.log("ClientsManager: Clients state updated with:", data);
      } else {
        console.log("ClientsManager: No data returned from Supabase");
        setClients([]);
      }
      
      setLastError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error fetching clients:", error);
      setLastError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch clients: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ClientsManager: Component mounted, checking connection...");
    checkConnection().then(() => {
      console.log("ClientsManager: Connection checked, now fetching clients...");
      fetchClients();
    });
    
    // Listen for client-added events
    const handleClientAdded = () => {
      console.log("ClientsManager: Detected client-added event, refreshing...");
      fetchClients();
    };
    
    document.addEventListener('client-added', handleClientAdded);
    
    return () => {
      document.removeEventListener('client-added', handleClientAdded);
    };
  }, []);

  // Function to invalidate queries and refresh data
  const refreshData = () => {
    console.log("Refreshing client data and invalidating queries...");
    checkConnection().then(fetchClients);
    queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
  };

  // Temporary function to seed a sample client if none exist
  const seedSampleClient = async () => {
    try {
      console.log("Seeding sample client...");
      const { data, error } = await supabase
        .from("clients")
        .insert({ 
          name: "Sample Client",
          manager: "Sample Manager",
          abbreviation: "SMPL",
          description: "This is a sample client created via the debug button"
        })
        .select();
      
      if (error) {
        console.error("Error seeding sample client:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Sample client seeded successfully",
      });
      
      // Refresh data
      fetchClients();
      queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
    } catch (error) {
      console.error("Error seeding sample client:", error);
      toast({
        title: "Error",
        description: "Failed to seed sample client",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage client companies</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ClientForm />
          <ClientsList clients={clients} isLoading={isLoading} />
          
          {/* Debug info */}
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="debug">
              <AccordionTrigger className="text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-2" />
                  Debug Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-xs text-muted-foreground space-y-2 p-2 bg-muted/50 rounded-md">
                  <p>Debug: Clients count: {clients.length}</p>
                  <p>Debug: Loading state: {isLoading ? 'Loading' : 'Not loading'}</p>
                  <p>Debug: Connection status: {connectionStatus}</p>
                  <p>Debug: Last error: {lastError || 'None'}</p>
                  <details>
                    <summary className="cursor-pointer">Table Info</summary>
                    <pre className="text-xs overflow-auto mt-2 p-2 bg-muted rounded-md">
                      {JSON.stringify(tableInfo, null, 2)}
                    </pre>
                  </details>
                  <div className="pt-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={seedSampleClient}
                      className="text-xs"
                    >
                      Add Sample Client (Debug)
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
