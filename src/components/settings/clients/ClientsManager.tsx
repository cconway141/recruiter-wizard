
import { useState, useEffect } from "react";
import { Client } from "./types";
import { ClientForm } from "./ClientForm";
import { ClientsList } from "./ClientsList";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

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
        setClients(data);
        console.log("ClientsManager: Clients state updated with:", data);
      } else {
        console.log("ClientsManager: No data returned from Supabase");
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ClientsManager: Component mounted, fetching clients...");
    fetchClients();
    
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
    fetchClients();
    queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage client companies</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ClientForm />
          <ClientsList clients={clients} isLoading={isLoading} />
          {/* Debug info */}
          <div className="text-xs text-muted-foreground mt-4">
            <p>Debug: Clients count: {clients.length}</p>
            <p>Debug: Loading state: {isLoading ? 'Loading' : 'Not loading'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
