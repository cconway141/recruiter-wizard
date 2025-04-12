
import { useState, useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "../JobFormDetails";
import { toast } from "@/hooks/use-toast";

export function useClientSelection(form: UseFormReturn<JobFormValues>) {
  const [lastSelectedClient, setLastSelectedClient] = useState<string | null>(null);
  const processingRef = useRef(false); // Keep the ref to track processing state
  
  // Track if this is the initial load
  const isInitialMountRef = useRef(true);
  
  // Get initial client value from form on mount - only once
  useEffect(() => {
    if (isInitialMountRef.current) {
      const currentClient = form.getValues("client");
      if (currentClient) {
        console.log("Initial client load:", currentClient);
        setLastSelectedClient(currentClient);
        handleClientSelection(currentClient, true);
      }
      
      // Mark initialization as complete
      isInitialMountRef.current = false;
    }
  }, [form]);

  const handleClientSelection = async (clientName: string, isInitialLoad = false) => {
    if (!clientName) return;
    
    // Prevent duplicate API calls for the same client
    if (clientName === lastSelectedClient && !isInitialLoad) {
      // Only log when it's not the initial load
      if (!isInitialMountRef.current) {
        console.log("Skipping duplicate client selection:", clientName);
      }
      return;
    }
    
    // Don't process if we're already fetching
    if (processingRef.current) {
      console.log("Already processing a client selection, skipping:", clientName);
      return;
    }
    
    try {
      console.log(`Fetching client description for: ${clientName} (initial load: ${isInitialLoad})`);
      setLastSelectedClient(clientName);
      processingRef.current = true; // Set processing flag
      
      // Fetch the client details from the database
      const { data, error } = await supabase
        .from("clients")
        .select("description")
        .eq("name", clientName)
        .maybeSingle();
        
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
