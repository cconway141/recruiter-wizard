
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
      try {
        console.log("useClientOptions: Fetching clients from Supabase...");
        
        // First verify Supabase connection
        const { error: connectionError } = await supabase.from("clients").select("count");
        
        if (connectionError) {
          console.error("useClientOptions: Connection test failed:", connectionError);
          throw new Error(`Connection error: ${connectionError.message}`);
        }
        
        console.log("useClientOptions: Connection test passed, fetching clients...");
        
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .order('name');
        
        if (error) {
          console.error("useClientOptions: Error fetching clients:", error);
          throw error;
        }
        
        console.log("useClientOptions: Fetched clients raw data:", data);
        
        // Make sure we're returning the data in the expected format
        const formattedData = (data || []).map(client => ({
          id: client.id,
          name: client.name
        }));
        
        console.log("useClientOptions: Formatted client data:", formattedData);
        return formattedData;
      } catch (error) {
        console.error("Error in useClientOptions:", error);
        throw error;
      }
    },
    // Force refetch on component mount
    refetchOnMount: true,
    // Add stale time to avoid too frequent refetches
    staleTime: 30000,
    // Add retry for better error handling
    retry: 2,
    retryDelay: 1000,
  });
};

export const useUserOptions = () => {
  return useQuery({
    queryKey: ["userOptions"],
    queryFn: async (): Promise<UserOption[]> => {
      try {
        console.log("useUserOptions: Fetching users from Supabase...");
        
        // First verify Supabase connection
        const { error: connectionError } = await supabase.from("profiles").select("count");
        
        if (connectionError) {
          console.error("useUserOptions: Connection test failed:", connectionError);
          throw new Error(`Connection error: ${connectionError.message}`);
        }
        
        console.log("useUserOptions: Connection test passed, fetching users...");
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*");
        
        if (error) {
          console.error("useUserOptions: Error fetching users:", error);
          throw error;
        }
        
        console.log("useUserOptions: Fetched users raw data:", data);
        
        // Make sure we handle both cases - whether display_name exists or not
        const formattedData = (data || []).map(user => ({
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
        
        console.log("useUserOptions: Formatted user data:", formattedData);
        return formattedData;
      } catch (error) {
        console.error("Error in useUserOptions:", error);
        throw error;
      }
    },
    // Force refetch on component mount
    refetchOnMount: true,
    // Add stale time to avoid too frequent refetches
    staleTime: 30000,
    // Add retry for better error handling
    retry: 2,
    retryDelay: 1000,
  });
};
