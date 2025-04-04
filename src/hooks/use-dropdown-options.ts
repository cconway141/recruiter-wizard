
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
  first_name: string;
  last_name: string;
  email: string;
  display_name: string;
}

export const useFlavorOptions = () => {
  return useQuery({
    queryKey: ["flavorOptions"],
    queryFn: async (): Promise<FlavorOption[]> => {
      const { data, error } = await supabase.from("flavors").select("*");
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
};

export const useLocaleOptions = () => {
  return useQuery({
    queryKey: ["localeOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase.from("locales").select("*");
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
};

export const useStatusOptions = () => {
  return useQuery({
    queryKey: ["statusOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase.from("job_statuses").select("*");
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
};

export const useClientOptions = () => {
  return useQuery({
    queryKey: ["clientOptions"],
    queryFn: async (): Promise<SimpleOption[]> => {
      const { data, error } = await supabase.from("clients").select("*");
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
};

export const useUserOptions = () => {
  return useQuery({
    queryKey: ["userOptions"],
    queryFn: async (): Promise<UserOption[]> => {
      const { data, error } = await supabase.from("profiles").select("*");
      
      if (error) {
        throw error;
      }
      
      return data?.map(user => ({
        ...user,
        display_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown User'
      })) || [];
    },
  });
};
