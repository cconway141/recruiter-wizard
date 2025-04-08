
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClientsList } from "./ClientsList";
import { ClientForm } from "./ClientForm";
import { Client } from "./types";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      toast({
        title: 'Error loading clients',
        description: 'There was a problem loading the client list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = async (client: Omit<Client, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setClients([...clients, data[0] as Client]);
        setShowAddForm(false);
        toast({
          title: 'Client added',
          description: `${client.name} has been added successfully.`,
        });
      }
    } catch (err) {
      console.error('Error adding client:', err);
      toast({
        title: 'Error adding client',
        description: 'There was a problem adding the client.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateClient = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          abbreviation: client.abbreviation,
          description: client.description,
          manager: client.manager
        })
        .eq('id', client.id);
        
      if (error) throw error;
      
      setClients(clients.map(c => c.id === client.id ? client : c));
      setEditingClient(null);
      toast({
        title: 'Client updated',
        description: `${client.name} has been updated successfully.`,
      });
    } catch (err) {
      console.error('Error updating client:', err);
      toast({
        title: 'Error updating client',
        description: 'There was a problem updating the client.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setClients(clients.filter(c => c.id !== id));
      toast({
        title: 'Client deleted',
        description: 'The client has been deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting client:', err);
      toast({
        title: 'Error deleting client',
        description: 'There was a problem deleting the client.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Clients</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            Add New Client
          </Button>
        )}
      </div>
      
      {showAddForm && (
        <div className="mb-6 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-4">Add New Client</h3>
          <ClientForm 
            onSubmit={handleAddClient} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}
      
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
        onEdit={setEditingClient} 
        onDelete={handleDeleteClient} 
      />
    </div>
  );
}
