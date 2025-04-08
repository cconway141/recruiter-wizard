
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Looks up an entity in the database by name
 * @param table The table to look in
 * @param nameField The field containing the name
 * @param nameValue The name value to search for
 * @returns The entity data or throws an error
 */
export async function lookupEntityByName(
  table: string, 
  nameField: string, 
  nameValue: string
) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(nameField, nameValue)
    .single();
  
  if (error) {
    console.error(`${table} lookup error:`, error);
    
    // For debugging purposes, fetch all entries to see what's available
    if (process.env.NODE_ENV === 'development') {
      const { data: allEntities } = await supabase
        .from(table)
        .select(`id, ${nameField}`);
      
      console.log(`All available ${table}:`, allEntities);
    }
    
    throw new Error(`${table} lookup failed: ${error.message}`);
  }
  
  return data;
}

/**
 * Inserts a job into the database
 * @param jobData The prepared job data ready for insertion
 * @returns The inserted job data
 */
export async function insertJobToDatabase(jobData: Record<string, any>) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select();

  if (error) {
    console.error("Error adding job:", error);
    throw new Error(`Database insert failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("No data returned after insertion");
  }
  
  return data[0];
}
