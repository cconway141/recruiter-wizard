
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash, Save, X, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface Client {
  id: string;
  name: string;
  manager: string;
  abbreviation: string;
  description: string;
}

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newManager, setNewManager] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newDescription, setNewDescription] = useState("");
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

  const handleAddClient = async () => {
    if (!newClient.trim() || !newManager.trim() || !newAbbreviation.trim() || !newDescription.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("clients")
        .insert({ 
          name: newClient,
          manager: newManager,
          abbreviation: newAbbreviation,
          description: newDescription
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Client "${newClient}" has been added.`,
      });
      
      setNewClient("");
      setNewManager("");
      setNewAbbreviation("");
      setNewDescription("");
      
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

  const handleStartEditing = (client: Client) => {
    setEditingClient({ ...client });
  };

  const handleCancelEditing = () => {
    setEditingClient(null);
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: editingClient.name,
          manager: editingClient.manager,
          abbreviation: editingClient.abbreviation,
          description: editingClient.description
        })
        .eq("id", editingClient.id);
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Client Name" 
              value={newClient} 
              onChange={(e) => setNewClient(e.target.value)} 
            />
            <Input 
              placeholder="Manager Name" 
              value={newManager} 
              onChange={(e) => setNewManager(e.target.value)} 
            />
            <Input 
              placeholder="Abbreviation" 
              value={newAbbreviation} 
              onChange={(e) => setNewAbbreviation(e.target.value)} 
            />
            <Input 
              placeholder="Company Description" 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
            />
            <Button onClick={handleAddClient} className="md:col-span-2">Add Client</Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                    <TableRow key={client.id}>
                      {editingClient && editingClient.id === client.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editingClient.name}
                              onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingClient.abbreviation}
                              onChange={(e) => setEditingClient({...editingClient, abbreviation: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingClient.manager}
                              onChange={(e) => setEditingClient({...editingClient, manager: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingClient.description}
                              onChange={(e) => setEditingClient({...editingClient, description: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateClient}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>{client.abbreviation}</TableCell>
                          <TableCell>{client.manager}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{client.description}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditing(client)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{client.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
