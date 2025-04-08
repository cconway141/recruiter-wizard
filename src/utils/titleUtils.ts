
import { supabase } from "@/integrations/supabase/client";
import { Locale } from "@/types/job";

/**
 * Generate internal title for a job
 */
export async function generateInternalTitle(
  client: string,
  candidateFacingTitle: string,
  flavor: string,
  locale: Locale
): Promise<string> {
  try {
    // Get client abbreviation
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('abbreviation')
      .eq('name', client)
      .single();
    
    if (clientError || !clientData) {
      console.error("Error fetching client abbreviation:", clientError);
      return `${client} ${candidateFacingTitle} - ${flavor} ${locale}`;
    }
    
    // Get role abbreviation
    const roleAbbr = await getRoleAbbreviation(candidateFacingTitle);
    
    // Get locale abbreviation
    const { data: localeData, error: localeError } = await supabase
      .from('locales')
      .select('abbreviation')
      .eq('name', locale)
      .single();
    
    if (localeError || !localeData) {
      console.error("Error fetching locale abbreviation:", localeError);
      
      // Fallback abbreviations
      const fallbackAbbreviations: Record<Locale, string> = {
        "Onshore": "On",
        "Nearshore": "Near", 
        "Offshore": "Off"
      };
      
      return `${clientData.abbreviation} ${roleAbbr} - ${flavor} ${fallbackAbbreviations[locale]}`;
    }
    
    // Construct the title with the desired format: ClientAbbr RoleAbbr - Flavor LocaleAbbr
    return `${clientData.abbreviation} ${roleAbbr} - ${flavor} ${localeData.abbreviation}`;
  } catch (err) {
    console.error("Error generating internal title:", err);
    
    // Fallback to a simple format
    return `${client} ${candidateFacingTitle} - ${flavor} ${locale}`;
  }
}

// Function to get role abbreviation from database
export async function getRoleAbbreviation(role: string): Promise<string> {
  try {
    // Try to get the abbreviation from the database
    const { data, error } = await supabase
      .from('role_abbreviations')
      .select('abbreviation')
      .eq('role_name', role)
      .single();
    
    if (error || !data) {
      console.warn(`Role abbreviation not found for: ${role}`);
      // Return the role itself if no abbreviation found
      return role;
    }
    
    return data.abbreviation;
  } catch (err) {
    console.error("Error fetching role abbreviation:", err);
    // Return the role itself if an error occurs
    return role;
  }
}

// Function to get all role abbreviations
export async function getAllRoleAbbreviations(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('role_abbreviations')
      .select('role_name, abbreviation');
    
    if (error || !data) {
      console.error("Error fetching role abbreviations:", error);
      // Return an empty object if there's an error
      return {};
    }
    
    // Convert array to object
    const abbreviationsMap: Record<string, string> = {};
    data.forEach(item => {
      abbreviationsMap[item.role_name] = item.abbreviation;
    });
    
    return abbreviationsMap;
  } catch (err) {
    console.error("Error processing role abbreviations:", err);
    return {};
  }
}
