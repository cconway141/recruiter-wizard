
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function ClientForm() {
  const [newClient, setNewClient] = useState("");
  const [newManager, setNewManager] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["clientOptions"] });
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
  );
}
