
import { useState, useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "../JobFormDetails";
import { toast } from "@/hooks/use-toast";

export function useClientSelection(form: UseFormReturn<JobFormValues>) {
  const [lastSelectedClient, setLastSelectedClient] = useState<string | null>(null);
  const processingRef = useRef(false); // Keep the ref to track processing state
  
  // Track if this is the initial form mount to prevent unnecessary API calls during initialization
  const initialMountRef = useRef(true);
  
  // Get initial client value from form on mount
  useEffect(() => {
    const currentClient = form.getValues("client");
    if (currentClient) {
      setLastSelectedClient(currentClient);
    }
    
    // After component has mounted, reset the initialMount flag
    return () => {
      initialMountRef.current = false;
    };
  }, [form]);

  const handleClientSelection = async (clientName: string) => {
    if (!clientName) return;
    
    // Prevent duplicate API calls for the same client or if currently processing
    if ((clientName === lastSelectedClient || processingRef.current) && !initialMountRef.current) {
      console.log("Skipping duplicate client selection:", clientName);
      return;
    }
    
    try {
      console.log("Fetching client description for:", clientName);
      setLastSelectedClient(clientName);
      processingRef.current = true; // Set processing flag
      
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
        form.setValue("compDesc", data.description, { 
          shouldValidate: true,
          shouldDirty: true 
        });
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
    } finally {
      processingRef.current = false; // Clear processing flag when complete
    }
  };

  return { handleClientSelection };
}
