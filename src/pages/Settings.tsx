
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
  const [newManager, setNewManager] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [clients, setClients] = useState<Array<{ id: string, name: string, manager: string, abbreviation: string, description: string }>>([]);
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
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Input 
                    placeholder="Client Name" 
                    value={newClient} 
                    onChange={(e) => setNewClient(e.target.value)} 
                    className="mb-2"
                  />
                  <Input 
                    placeholder="Manager Name" 
                    value={newManager} 
                    onChange={(e) => setNewManager(e.target.value)} 
                    className="mb-2"
                  />
                  <Input 
                    placeholder="Abbreviation" 
                    value={newAbbreviation} 
                    onChange={(e) => setNewAbbreviation(e.target.value)} 
                    className="mb-2"
                  />
                  <Input 
                    placeholder="Company Description" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)} 
                    className="mb-2"
                  />
                  <Button onClick={handleAddClient} className="col-span-2">Add Client</Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  {clients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No clients added</div>
                  ) : (
                    clients.map((client) => (
                      <div key={client.id} className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{client.name} ({client.abbreviation})</span>
                        </div>
                        <div className="text-sm text-gray-600">Manager: {client.manager}</div>
                        <div className="text-sm text-gray-600 mt-1">{client.description}</div>
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
