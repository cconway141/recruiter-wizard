
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClientOptions } from "@/hooks/use-dropdown-options";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
});

export default function Settings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: clientOptions, isLoading, refetch } = useClientOptions();
  
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .insert({ name: values.name });

      if (error) throw error;
      
      toast({
        title: "Client added",
        description: `${values.name} has been added successfully.`,
      });
      
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error adding client",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Client deleted",
        description: `${name} has been deleted successfully.`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <PageHeader
        title="Settings"
        description="Configure application settings and manage dropdown options."
      />
      
      <Tabs defaultValue="clients" className="mt-6">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>
                  Add a new client to the dropdown options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter client name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Client
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client List</CardTitle>
                  <CardDescription>
                    Manage existing clients
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : clientOptions?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No clients found. Add your first client.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {clientOptions?.map((client) => (
                      <div 
                        key={client.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                      >
                        <span>{client.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClient(client.id, client.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
