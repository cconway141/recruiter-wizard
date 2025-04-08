
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@/components/settings/clients/types";
import { ClientForm } from "./clients/ClientForm";
import { ClientsList } from "./clients/ClientsList";

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
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
    fetchClients();
  }, []);

  // Function to invalidate queries and refresh data
  const refreshData = () => {
    console.log("Refreshing client data and invalidating queries...");
    fetchClients();
    queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
  };

  const handleAddClient = async (client: Omit<Client, "id">) => {
    try {
      const { error } = await supabase
        .from("clients")
        .insert(client);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Client "${client.name}" has been added.`,
      });
      
      // Refresh data after adding
      refreshData();
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: updatedClient.name,
          manager: updatedClient.manager,
          abbreviation: updatedClient.abbreviation,
          description: updatedClient.description
        })
        .eq("id", updatedClient.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      
      setEditingClient(null);
      
      // Refresh data after updating
      refreshData();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      
      // Refresh data after deleting
      refreshData();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client. It may be referenced by existing jobs.",
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
          <div className="mb-6 p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">Add New Client</h3>
            <ClientForm 
              onSubmit={handleAddClient} 
              onCancel={() => {}} 
            />
          </div>
          
          {editingClient && (
            <div className="mb-6 p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-4">Edit Client</h3>
              <ClientForm 
                client={editingClient}
                onSubmit={handleUpdateClient} 
                onCancel={() => setEditingClient(null)} 
              />
            </div>
          )}
          
          <ClientsList 
            clients={clients}
            isLoading={isLoading}
            onEdit={setEditingClient} 
            onDelete={handleDeleteClient} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
