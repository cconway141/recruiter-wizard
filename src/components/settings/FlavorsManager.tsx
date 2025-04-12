
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useSortableTable } from "@/hooks/useSortableTable";
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

interface Flavor {
  id: string;
  name: string;
  label?: string; // Make label optional to handle transition period
}

export function FlavorsManager() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  
  const { sortField, sortDirection, handleSort, sortedData: sortedFlavors } = 
    useSortableTable<Flavor, "name">(flavors, "name");

  const fetchFlavors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("flavors")
        .select("id, name, label")
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setFlavors(data);
      }
    } catch (error) {
      console.error("Error fetching flavors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch flavors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlavors();
  }, []);

  const handleAddFlavor = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // For new records, make sure to add both name and label fields
      const { error } = await supabase
        .from("flavors")
        .insert({ 
          name: newName,
          label: newName // Set label to match name for backward compatibility
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Flavor "${newName}" has been added.`,
      });
      
      setNewName("");
      fetchFlavors();
    } catch (error) {
      console.error("Error adding flavor:", error);
      toast({
        title: "Error",
        description: "Failed to add flavor",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = (flavor: Flavor) => {
    setEditingFlavor({ ...flavor });
  };

  const handleCancelEditing = () => {
    setEditingFlavor(null);
  };

  const handleUpdateFlavor = async () => {
    if (!editingFlavor) return;
    
    try {
      const { error } = await supabase
        .from("flavors")
        .update({
          name: editingFlavor.name,
          label: editingFlavor.name // Update label to match name
        })
        .eq("id", editingFlavor.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Flavor updated successfully",
      });
      
      setEditingFlavor(null);
      fetchFlavors();
    } catch (error) {
      console.error("Error updating flavor:", error);
      toast({
        title: "Error",
        description: "Failed to update flavor",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteFlavor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("flavors")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Flavor deleted successfully",
      });
      
      fetchFlavors();
    } catch (error) {
      console.error("Error deleting flavor:", error);
      toast({
        title: "Error",
        description: "Failed to delete flavor. It may be referenced by existing jobs.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flavors</CardTitle>
        <CardDescription>Manage job flavors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="Flavor Name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              className="max-w-sm"
            />
            <Button onClick={handleAddFlavor}>Add Flavor</Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader 
                    title="Name"
                    field="name"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      Loading flavors...
                    </TableCell>
                  </TableRow>
                ) : sortedFlavors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      No flavors found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedFlavors.map((flavor) => (
                    <TableRow key={flavor.id}>
                      {editingFlavor && editingFlavor.id === flavor.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editingFlavor.name}
                              onChange={(e) => setEditingFlavor({...editingFlavor, name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateFlavor}>
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
                          <TableCell>{flavor.name}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditing(flavor)}>
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
                                    <AlertDialogTitle>Delete Flavor</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{flavor.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteFlavor(flavor.id)}>
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
