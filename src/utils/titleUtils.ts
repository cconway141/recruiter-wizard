
import { supabase } from "@/integrations/supabase/client";
import { Locale } from "@/types/job";
import { displayFormValue } from "@/utils/formFieldUtils";

/**
 * Generate internal title for a job
 */
export async function generateInternalTitle(
  client: string,
  candidateFacingTitle: string,
  flavor: string | { id: string; name: string },
  locale: Locale | { id: string; name: string }
): Promise<string> {
  try {
    // Ensure we have string values for flavor and locale using displayFormValue utility
    const flavorName = displayFormValue(flavor);
    const localeName = displayFormValue(locale);
    
    // Get client abbreviation
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('abbreviation')
      .eq('name', client)
      .single();
    
    if (clientError || !clientData) {
      console.error("Error fetching client abbreviation:", clientError);
      return `${client} ${candidateFacingTitle} - ${flavorName} ${localeName}`;
    }
    
    // Get role abbreviation
    const roleAbbr = await getRoleAbbreviation(candidateFacingTitle);
    
    // Get locale abbreviation
    const { data: localeData, error: localeError } = await supabase
      .from('locales')
      .select('abbreviation')
      .eq('name', localeName)
      .single();
    
    if (localeError || !localeData) {
      console.error("Error fetching locale abbreviation:", localeError);
      
      // Fallback abbreviations
      const fallbackAbbreviations: Record<string, string> = {
        "Onshore": "On",
        "Nearshore": "Near", 
        "Offshore": "Off"
      };
      
      const localeAbbr = fallbackAbbreviations[localeName] || localeName.substring(0, 3);
      
      return `${clientData.abbreviation} ${roleAbbr} - ${flavorName} ${localeAbbr}`;
    }
    
    // Construct the title with the desired format: ClientAbbr RoleAbbr - Flavor LocaleAbbr
    return `${clientData.abbreviation} ${roleAbbr} - ${flavorName} ${localeData.abbreviation}`;
  } catch (err) {
    console.error("Error generating internal title:", err);
    
    // Use displayFormValue to safely convert object values to strings in fallback
    const flavorStr = displayFormValue(flavor);
    const localeStr = displayFormValue(locale);
    
    // Fallback to a simple format
    return `${client} ${candidateFacingTitle} - ${flavorStr} ${localeStr}`;
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
      // Return the first 3 characters of the role if no abbreviation found
      return role.slice(0, 3).toUpperCase();
    }
    
    return data.abbreviation;
  } catch (err) {
    console.error("Error fetching role abbreviation:", err);
    // Return first 3 characters of role if an error occurs
    return role.slice(0, 3).toUpperCase();
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
