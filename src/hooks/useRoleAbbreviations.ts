
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoleAbbreviation {
  id: string;
  role_name: string;
  abbreviation: string;
}

export function useRoleAbbreviations() {
  return useQuery({
    queryKey: ['roleAbbreviations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_abbreviations')
        .select('id, role_name, abbreviation')
        .order('role_name');

      if (error) {
        console.error("Error fetching role abbreviations:", error);
        throw new Error(error.message);
      }
      
      return data as RoleAbbreviation[];
    }
  });
}
