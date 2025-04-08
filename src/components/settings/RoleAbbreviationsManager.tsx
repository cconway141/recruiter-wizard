
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash, Save, X, Plus } from "lucide-react";
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

interface RoleAbbreviation {
  id: string;
  role_name: string;
  abbreviation: string;
  created_at?: string;
  updated_at?: string;
}

export function RoleAbbreviationsManager() {
  const [roleAbbreviations, setRoleAbbreviations] = useState<RoleAbbreviation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [editingRole, setEditingRole] = useState<RoleAbbreviation | null>(null);
  
  const { sortField, sortDirection, handleSort, sortedData: sortedRoles } = 
    useSortableTable<RoleAbbreviation, "role_name" | "abbreviation">(roleAbbreviations, "role_name");

  const fetchRoleAbbreviations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("role_abbreviations")
        .select("*")
        .order('role_name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRoleAbbreviations(data as RoleAbbreviation[]);
      }
    } catch (error) {
      console.error("Error fetching role abbreviations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch role abbreviations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleAbbreviations();
  }, []);

  const handleAddRole = async () => {
    if (!newRoleName.trim() || !newAbbreviation.trim()) {
      toast({
        title: "Error",
        description: "Role name and abbreviation are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("role_abbreviations")
        .insert({ 
          role_name: newRoleName,
          abbreviation: newAbbreviation
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Role "${newRoleName}" has been added.`,
      });
      
      setNewRoleName("");
      setNewAbbreviation("");
      fetchRoleAbbreviations();
    } catch (error) {
      console.error("Error adding role abbreviation:", error);
      toast({
        title: "Error",
        description: "Failed to add role abbreviation",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = (role: RoleAbbreviation) => {
    setEditingRole({ ...role });
  };

  const handleCancelEditing = () => {
    setEditingRole(null);
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      const { error } = await supabase
        .from("role_abbreviations")
        .update({ 
          role_name: editingRole.role_name,
          abbreviation: editingRole.abbreviation
        })
        .eq("id", editingRole.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Role abbreviation updated successfully",
      });
      
      setEditingRole(null);
      fetchRoleAbbreviations();
    } catch (error) {
      console.error("Error updating role abbreviation:", error);
      toast({
        title: "Error",
        description: "Failed to update role abbreviation",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from("role_abbreviations")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Role abbreviation deleted successfully",
      });
      
      fetchRoleAbbreviations();
    } catch (error) {
      console.error("Error deleting role abbreviation:", error);
      toast({
        title: "Error",
        description: "Failed to delete role abbreviation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Abbreviations</CardTitle>
        <CardDescription>Manage role name abbreviations used in job titles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role Name</label>
                <Input 
                  placeholder="Software Engineer" 
                  value={newRoleName} 
                  onChange={(e) => setNewRoleName(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Abbreviation</label>
                <Input 
                  placeholder="DEV" 
                  value={newAbbreviation} 
                  onChange={(e) => setNewAbbreviation(e.target.value)} 
                />
              </div>
            </div>
            <Button onClick={handleAddRole} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Role Abbreviation
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader 
                    title="Role Name"
                    field="role_name"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader 
                    title="Abbreviation"
                    field="abbreviation"
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleAbbreviations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No role abbreviations found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRoles.map((role) => (
                    <TableRow key={role.id}>
                      {editingRole && editingRole.id === role.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editingRole.role_name}
                              onChange={(e) => setEditingRole({...editingRole, role_name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingRole.abbreviation}
                              onChange={(e) => setEditingRole({...editingRole, abbreviation: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateRole}>
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
                          <TableCell className="font-medium">{role.role_name}</TableCell>
                          <TableCell>{role.abbreviation}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditing(role)}>
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
                                    <AlertDialogTitle>Delete Role Abbreviation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{role.role_name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRole(role.id)}>
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
