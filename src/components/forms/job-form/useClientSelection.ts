
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { JobFormValues } from "../JobFormDetails";

export function useClientSelection(form: UseFormReturn<JobFormValues>) {
  const handleClientSelection = async (clientName: string) => {
    if (!clientName) return;
    
    try {
      // Fetch the client details from the database
      const { data, error } = await supabase
        .from("clients")
        .select("description")
        .eq("name", clientName)
        .single();
        
      if (error) throw error;
      
      // Set the company description from the client data
      if (data?.description) {
        form.setValue("compDesc", data.description);
      }
    } catch (err) {
      console.error("Error fetching client description:", err);
    }
  };

  return { handleClientSelection };
}
