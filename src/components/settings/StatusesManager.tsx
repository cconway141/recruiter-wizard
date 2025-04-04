
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

interface JobStatus {
  id: string;
  name: string;
}

export function StatusesManager() {
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [editingStatus, setEditingStatus] = useState<JobStatus | null>(null);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setStatuses(data);
      }
    } catch (error) {
      console.error("Error fetching job statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch job statuses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleAddStatus = async () => {
    if (!newStatus.trim()) {
      toast({
        title: "Error",
        description: "Status name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("job_statuses")
        .insert({ name: newStatus });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Job status "${newStatus}" has been added.`,
      });
      
      setNewStatus("");
      fetchStatuses();
    } catch (error) {
      console.error("Error adding job status:", error);
      toast({
        title: "Error",
        description: "Failed to add job status",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = (status: JobStatus) => {
    setEditingStatus({ ...status });
  };

  const handleCancelEditing = () => {
    setEditingStatus(null);
  };

  const handleUpdateStatus = async () => {
    if (!editingStatus) return;
    
    try {
      const { error } = await supabase
        .from("job_statuses")
        .update({ name: editingStatus.name })
        .eq("id", editingStatus.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Job status updated successfully",
      });
      
      setEditingStatus(null);
      fetchStatuses();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from("job_statuses")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Job status deleted successfully",
      });
      
      fetchStatuses();
    } catch (error) {
      console.error("Error deleting job status:", error);
      toast({
        title: "Error",
        description: "Failed to delete job status. It may be referenced by existing jobs.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Statuses</CardTitle>
        <CardDescription>Manage job statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex space-x-4">
            <Input 
              placeholder="Status Name" 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)} 
              className="max-w-sm"
            />
            <Button onClick={handleAddStatus}>Add Status</Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                      No job statuses found
                    </TableCell>
                  </TableRow>
                ) : (
                  statuses.map((status) => (
                    <TableRow key={status.id}>
                      {editingStatus && editingStatus.id === status.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editingStatus.name}
                              onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateStatus}>
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
                          <TableCell>{status.name}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditing(status)}>
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
                                    <AlertDialogTitle>Delete Job Status</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{status.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteStatus(status.id)}>
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
