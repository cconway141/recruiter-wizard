
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Locale {
  id: string;
  name: string;
  work_details: string;
  pay_details: string;
}

export function LocalesManager() {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newLocale, setNewLocale] = useState("");
  const [newWorkDetails, setNewWorkDetails] = useState("");
  const [newPayDetails, setNewPayDetails] = useState("");
  const [editingLocale, setEditingLocale] = useState<Locale | null>(null);

  const fetchLocales = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("locales")
        .select("*")
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setLocales(data);
      }
    } catch (error) {
      console.error("Error fetching locales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch locales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocales();
  }, []);

  const handleAddLocale = async () => {
    if (!newLocale.trim()) {
      toast({
        title: "Error",
        description: "Locale name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("locales")
        .insert({ 
          name: newLocale,
          work_details: newWorkDetails,
          pay_details: newPayDetails 
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Locale "${newLocale}" has been added.`,
      });
      
      setNewLocale("");
      setNewWorkDetails("");
      setNewPayDetails("");
      fetchLocales();
    } catch (error) {
      console.error("Error adding locale:", error);
      toast({
        title: "Error",
        description: "Failed to add locale",
        variant: "destructive",
      });
    }
  };

  const handleStartEditing = (locale: Locale) => {
    setEditingLocale({ ...locale });
  };

  const handleCancelEditing = () => {
    setEditingLocale(null);
  };

  const handleUpdateLocale = async () => {
    if (!editingLocale) return;
    
    try {
      const { error } = await supabase
        .from("locales")
        .update({ 
          name: editingLocale.name,
          work_details: editingLocale.work_details,
          pay_details: editingLocale.pay_details 
        })
        .eq("id", editingLocale.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Locale updated successfully",
      });
      
      setEditingLocale(null);
      fetchLocales();
    } catch (error) {
      console.error("Error updating locale:", error);
      toast({
        title: "Error",
        description: "Failed to update locale",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteLocale = async (id: string) => {
    try {
      const { error } = await supabase
        .from("locales")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Locale deleted successfully",
      });
      
      fetchLocales();
    } catch (error) {
      console.error("Error deleting locale:", error);
      toast({
        title: "Error",
        description: "Failed to delete locale. It may be referenced by existing jobs.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locales</CardTitle>
        <CardDescription>Manage job locations and their default settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Location Name</label>
                <Input 
                  placeholder="Location Name" 
                  value={newLocale} 
                  onChange={(e) => setNewLocale(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Work Details</label>
                <Textarea 
                  placeholder="Default work details for this location" 
                  value={newWorkDetails} 
                  onChange={(e) => setNewWorkDetails(e.target.value)} 
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pay Details</label>
                <Textarea 
                  placeholder="Default payment details for this location" 
                  value={newPayDetails} 
                  onChange={(e) => setNewPayDetails(e.target.value)} 
                  rows={3}
                />
              </div>
              <Button onClick={handleAddLocale} className="w-full sm:w-auto">Add Location</Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Work Details</TableHead>
                  <TableHead>Pay Details</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No locales found
                    </TableCell>
                  </TableRow>
                ) : (
                  locales.map((locale) => (
                    <TableRow key={locale.id}>
                      {editingLocale && editingLocale.id === locale.id ? (
                        <>
                          <TableCell className="align-top">
                            <Input 
                              value={editingLocale.name}
                              onChange={(e) => setEditingLocale({...editingLocale, name: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <Textarea 
                              value={editingLocale.work_details || ''}
                              onChange={(e) => setEditingLocale({...editingLocale, work_details: e.target.value})}
                              rows={3}
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <Textarea 
                              value={editingLocale.pay_details || ''}
                              onChange={(e) => setEditingLocale({...editingLocale, pay_details: e.target.value})}
                              rows={3}
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateLocale}>
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
                          <TableCell className="align-top font-medium">{locale.name}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-3 whitespace-normal">
                              {locale.work_details || "Not set"}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-3 whitespace-normal">
                              {locale.pay_details || "Not set"}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditing(locale)}>
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
                                    <AlertDialogTitle>Delete Locale</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{locale.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLocale(locale.id)}>
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
