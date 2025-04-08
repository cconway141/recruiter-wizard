
import { useState } from "react";
import { Client } from "./types";
import { ClientItem } from "./ClientItem";
import { EditableClientItem } from "./EditableClientItem";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientsListProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientsList({ clients, isLoading, onEdit, onDelete }: ClientsListProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  const handleStartEditing = (client: Client) => {
    setEditingClient({ ...client });
    onEdit(client);
  };

  const handleCancelEditing = () => {
    setEditingClient(null);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    if (!updatedClient) return;
    
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
      queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
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
      queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
      onDelete(id);
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Name</TableHead>
            <TableHead className="w-[10%]">Abbreviation</TableHead>
            <TableHead className="w-[15%]">Manager</TableHead>
            <TableHead className="w-[50%]">Description</TableHead>
            <TableHead className="w-[10%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                Loading clients...
              </TableCell>
            </TableRow>
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              editingClient && editingClient.id === client.id ? (
                <EditableClientItem 
                  key={client.id}
                  client={editingClient}
                  onUpdate={handleUpdateClient}
                  onCancel={handleCancelEditing}
                />
              ) : (
                <ClientItem 
                  key={client.id}
                  client={client}
                  onEdit={handleStartEditing}
                  onDelete={handleDeleteClient}
                />
              )
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
