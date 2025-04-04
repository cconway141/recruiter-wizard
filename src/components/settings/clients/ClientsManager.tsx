
import { useState, useEffect } from "react";
import { Client } from "./types";
import { ClientForm } from "./ClientForm";
import { ClientsList } from "./ClientsList";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      console.log("ClientsManager: Fetching clients...");
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("ClientsManager: Fetched clients:", data);
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
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
        </div>
      </CardContent>
    </Card>
  );
}
