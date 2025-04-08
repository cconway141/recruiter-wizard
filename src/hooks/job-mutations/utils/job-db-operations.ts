
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Use string literal type instead of a union type to avoid excessive type instantiation
type TableName = string;

/**
 * Looks up an entity in the database by name
 * @param table The table to look in (must be a valid table name)
 * @param nameField The field containing the name
 * @param nameValue The name value to search for
 * @returns The entity data or throws an error
 */
export async function lookupEntityByName(
  table: TableName, 
  nameField: string, 
  nameValue: string
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from(table as any)
    .select('id')
    .eq(nameField, nameValue)
    .single();
  
  if (error) {
    console.error(`${table} lookup error:`, error);
    
    // For debugging purposes, fetch all entries to see what's available
    if (process.env.NODE_ENV === 'development') {
      const { data: allEntities } = await supabase
        .from(table as any)
        .select(`id, ${nameField}`);
      
      console.log(`All available ${table}:`, allEntities);
    }
    
    throw new Error(`${table} lookup failed: ${error.message}`);
  }
  
  // Validate that data exists and has an id property
  if (!data) {
    throw new Error(`${table} lookup failed: No data returned`);
  }
  
  if (typeof data !== 'object' || !('id' in data)) {
    throw new Error(`${table} lookup failed: Invalid data structure`);
  }
  
  return { id: data.id };
}

/**
 * Inserts a job into the database
 * @param jobData The prepared job data ready for insertion
 * @returns The inserted job data
 */
export async function insertJobToDatabase(jobData: Record<string, any>) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData as any)
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
