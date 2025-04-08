
import { useState, useEffect } from "react";
import { ClientForm } from "@/components/settings/clients/ClientForm";
import { ClientsList } from "@/components/settings/clients/ClientsList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useClientOptions } from "@/hooks/use-dropdown-options";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "./clients/types";
import { toast } from "@/components/ui/use-toast";

export function ClientsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refetch } = useClientOptions();

  // Fetch full client data
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setClients(data as Client[]);
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

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmitSuccess = () => {
    setIsAdding(false);
    fetchClients();
    refetch();
  };

  const handleEdit = () => {
    // This will refresh the list after editing
    fetchClients();
    refetch();
  };

  const handleDelete = () => {
    fetchClients();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Management</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      {isAdding ? (
        <ClientForm onCancel={() => setIsAdding(false)} onSubmit={handleSubmitSuccess} />
      ) : (
        <ClientsList clients={clients} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
