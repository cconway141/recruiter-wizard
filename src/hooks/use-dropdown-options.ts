
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlavorOption {
  id: string;
  name: string;
  label: string;
}

export interface SimpleOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  display_name: string;
}

export const useFlavorOptions = () => {
  return useQuery({
    queryKey: ["flavorOptions"],
    queryFn: async (): Promise<FlavorOption[]> => {
      const { data, error } = await supabase
        .from("flavors")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      return data as FlavorOption[] || [];
    },
  });
};

export const useLocaleOptions = () => {
  return useQuery({
    queryKey: ["localeOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase
        .from("locales")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      return data as SimpleOption[] || [];
    },
  });
};

export const useStatusOptions = () => {
  return useQuery({
    queryKey: ["statusOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase
        .from("job_statuses")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      return data as SimpleOption[] || [];
    },
  });
};

export const useClientOptions = () => {
  return useQuery({
    queryKey: ["clientOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order('name');
      
      if (error) {
        console.error("Error fetching clients:", error);
        throw error;
      }
      
      console.log("Fetched clients:", data);
      return data as SimpleOption[] || [];
    },
  });
};

export const useUserOptions = () => {
  return useQuery({
    queryKey: ["userOptions"],
    queryFn: async (): Promise<UserOption[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      // Make sure we handle both cases - whether display_name exists or not
      return (data || []).map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // Fallback chain in case display_name isn't set
        display_name: user.display_name || 
                     `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                     user.email?.split('@')[0] || 
                     'Unknown User'
      }));
    },
  });
};
