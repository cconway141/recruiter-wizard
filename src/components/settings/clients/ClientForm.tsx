
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export function ClientForm() {
  const [newClient, setNewClient] = useState("");
  const [newManager, setNewManager] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
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
    
    setIsSubmitting(true);
    setLastError(null);
    
    try {
      console.log("ClientForm: Adding new client:", { 
        name: newClient,
        manager: newManager,
        abbreviation: newAbbreviation,
        description: newDescription
      });
      
      // Verify Supabase connection before attempting insert
      const { data: connectionTest, error: connectionError } = await supabase.from("clients").select("count");
      
      if (connectionError) {
        console.error("ClientForm: Connection test failed:", connectionError);
        throw new Error(`Connection error: ${connectionError.message}`);
      }
      
      console.log("ClientForm: Connection test passed:", connectionTest);
      
      const { data, error } = await supabase
        .from("clients")
        .insert({ 
          name: newClient,
          manager: newManager,
          abbreviation: newAbbreviation,
          description: newDescription
        })
        .select();
      
      if (error) {
        console.error("ClientForm: Error adding client:", error);
        setLastError(error.message);
        throw error;
      }
      
      console.log("ClientForm: Client added successfully:", data);
      
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
      // Trigger a refetch in the parent component
      document.dispatchEvent(new CustomEvent('client-added'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error adding client:", error);
      setLastError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to add client: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test function to add a sample client - this helps debug the form
  const addSampleClient = async () => {
    setNewClient("Sample Client");
    setNewManager("Sample Manager");
    setNewAbbreviation("SMPL");
    setNewDescription("This is a sample client for testing purposes");
    
    // Wait for state to update
    setTimeout(handleAddClient, 100);
  };

  return (
    <div className="space-y-4">
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
        <Button 
          onClick={handleAddClient} 
          className="md:col-span-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Client'}
        </Button>
      </div>
      
      {/* For debugging purposes */}
      <div className="text-xs text-muted-foreground mt-4 border-t pt-2">
        <p>Debug: Last error: {lastError || 'None'}</p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addSampleClient}
            className="text-xs"
          >
            Add Sample Client (Debug)
          </Button>
        </div>
      </div>
    </div>
  );
}
