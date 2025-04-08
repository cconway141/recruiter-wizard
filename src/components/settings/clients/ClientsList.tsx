
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
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientsListProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

type SortField = "name" | "abbreviation" | "manager" | "description";
type SortDirection = "asc" | "desc";

export function ClientsList({ clients, isLoading, onEdit, onDelete }: ClientsListProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleStartEditing = (client: Client) => {
    setEditingClient({ ...client });
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
      onEdit();
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedClients = () => {
    if (!clients.length) return [];
    
    return [...clients].sort((a, b) => {
      const aValue = a[sortField] ? String(a[sortField]).toLowerCase() : '';
      const bValue = b[sortField] ? String(b[sortField]).toLowerCase() : '';
      
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? 
      <ArrowDownAZ className="h-4 w-4 ml-1" /> : 
      <ArrowUpAZ className="h-4 w-4 ml-1" />;
  };

  const sortedClients = getSortedClients();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                Name {renderSortIcon("name")}
              </div>
            </TableHead>
            <TableHead className="w-[10%]">
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("abbreviation")}>
                Abbreviation {renderSortIcon("abbreviation")}
              </div>
            </TableHead>
            <TableHead className="w-[15%]">
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("manager")}>
                Manager {renderSortIcon("manager")}
              </div>
            </TableHead>
            <TableHead className="w-[50%]">
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("description")}>
                Description {renderSortIcon("description")}
              </div>
            </TableHead>
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
          ) : sortedClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            sortedClients.map((client) => (
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
