
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AirtableSetup } from "@/components/settings/AirtableSetup";
import { supabase } from "@/integrations/supabase/client";
import { useJobs } from "@/contexts/JobContext";

const Settings = () => {
  const [newClient, setNewClient] = useState("");
  const [clients, setClients] = useState<Array<{ id: string, name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAirtableEnabled } = useJobs();

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      if (data) {
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

  const handleAddClient = async () => {
    if (!newClient.trim()) return;
    
    try {
      const { error } = await supabase
        .from("clients")
        .insert({ name: newClient });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Client "${newClient}" has been added.`,
      });
      
      setNewClient("");
      fetchClients();
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader title="Settings" description="Configure application settings and integrations." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Manage client companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add new client" 
                    value={newClient} 
                    onChange={(e) => setNewClient(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                  />
                  <Button onClick={handleAddClient}>Add</Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  {clients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No clients added</div>
                  ) : (
                    clients.map((client) => (
                      <div key={client.id} className="p-3 flex justify-between items-center">
                        <span>{client.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isAirtableEnabled && (
            <AirtableSetup />
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
