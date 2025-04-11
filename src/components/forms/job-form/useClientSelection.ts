
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "../JobFormDetails";
import { toast } from "@/hooks/use-toast";

export function useClientSelection(form: UseFormReturn<JobFormValues>) {
  const [lastSelectedClient, setLastSelectedClient] = useState<string | null>(null);

  const handleClientSelection = async (clientName: string) => {
    if (!clientName) return;
    
    // Prevent duplicate API calls for the same client
    if (clientName === lastSelectedClient) {
      console.log("Skipping duplicate client selection:", clientName);
      return;
    }
    
    try {
      console.log("Fetching client description for:", clientName);
      setLastSelectedClient(clientName);
      
      // Fetch the client details from the database
      const { data, error } = await supabase
        .from("clients")
        .select("description")
        .eq("name", clientName)
        .maybeSingle(); // Using maybeSingle instead of single to handle potential empty results
        
      if (error) {
        console.error("Error fetching client description:", error);
        toast({
          title: "Error",
          description: "Failed to load client description",
          variant: "destructive",
        });
        return;
      }
      
      // Set the company description from the client data
      if (data?.description) {
        form.setValue("compDesc", data.description);
      } else {
        console.log("No description found for client:", clientName);
      }
    } catch (err) {
      console.error("Error in client selection handler:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading client data",
        variant: "destructive",
      });
    }
  };

  return { handleClientSelection };
}
