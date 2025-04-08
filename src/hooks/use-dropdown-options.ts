import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Interface for a dropdown option
export interface DropdownOption {
  id: string;
  name: string;
}

// Interface for user profiles
export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  display_name: string | null;
}

// Fetch client options
export function useClientOptions() {
  return useQuery({
    queryKey: ['clientOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

      if (error) {
        console.error("Error fetching clients:", error);
        throw new Error(error.message);
      }

      console.log("useClientOptions: Formatted client data:", data);
      
      return data as DropdownOption[];
    }
  });
}

// Fetch locale options
export function useLocaleOptions() {
  return useQuery({
    queryKey: ['localeOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locales')
        .select('id, name')
        .order('name');

      if (error) {
        console.error("Error fetching locales:", error);
        throw new Error(error.message);
      }
      
      return data as DropdownOption[];
    }
  });
}

// Fetch flavor options
export function useFlavorOptions() {
  return useQuery({
    queryKey: ['flavorOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flavors')
        .select('id, name')
        .order('name');

      if (error) {
        console.error("Error fetching flavors:", error);
        throw new Error(error.message);
      }
      
      return data as DropdownOption[];
    }
  });
}

// Fetch status options
export function useStatusOptions() {
  return useQuery({
    queryKey: ['statusOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_statuses')
        .select('id, name')
        .order('name');

      if (error) {
        console.error("Error fetching job statuses:", error);
        throw new Error(error.message);
      }
      
      return data as DropdownOption[];
    }
  });
}
