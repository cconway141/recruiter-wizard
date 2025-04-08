
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "../JobFormDetails";

export function useClientSelection(form: UseFormReturn<JobFormValues>) {
  const handleClientSelection = async (clientName: string) => {
    try {
      // Fetch client data from Supabase to get the description
      const { data, error } = await supabase
        .from('clients')
        .select('description')
        .eq('name', clientName)
        .single();
        
      if (error) {
        console.error("Error fetching client description:", error);
        return;
      }
      
      if (data && data.description) {
        form.setValue("compDesc", data.description);
      }
    } catch (err) {
      console.error("Error in handleClientSelection:", err);
    }
  };

  return { handleClientSelection };
}
