
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
    // Get locale abbreviation from database
    const { data: localeData, error: localeError } = await supabase
      .from('locales')
      .select('abbreviation')
      .eq('name', locale)
      .single();
    
    if (localeError || !localeData) {
      console.error("Error fetching locale abbreviation:", localeError);
      // Fallback to hardcoded abbreviations
      const fallbackAbbreviations: Record<Locale, string> = {
        "Onshore": "On",
        "Nearshore": "Near",
        "Offshore": "Off"
      };
      
      // Get role abbreviation from the title (simplified approach)
      // Assuming candidateFacingTitle contains the role
      const roleWords = candidateFacingTitle.split(' ');
      const firstWord = roleWords[0]; // e.g., "Sr.", "Full", etc.
      
      return `${client} | ${fallbackAbbreviations[locale]} | ${candidateFacingTitle} | ${flavor}`;
    }
    
    // Use the abbreviation from the database
    const localeAbbreviation = localeData.abbreviation;
    
    return `${client} | ${localeAbbreviation} | ${candidateFacingTitle} | ${flavor}`;
  } catch (err) {
    console.error("Error generating internal title:", err);
    // Return a fallback title
    return `${client} | ${candidateFacingTitle} | ${flavor}`;
  }
}

/**
 * Calculate high, medium, and low rates from a base rate
 */
export function calculateRates(rate: number) {
  // Calculate rates
  const high = rate;
  const medium = Math.floor(rate * 0.85);
  const low = Math.floor(rate * 0.7);
  
  return { high, medium, low };
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

/**
 * Get work details based on locale
 */
export async function getWorkDetails(locale: Locale): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('locales')
      .select('work_details')
      .eq('name', locale)
      .single();
    
    if (error || !data) {
      console.error("Error fetching work details:", error);
      return "";
    }
    
    return data.work_details || "";
  } catch (err) {
    console.error("Error in getWorkDetails:", err);
    return "";
  }
}

/**
 * Get pay details based on locale
 */
export async function getPayDetails(locale: Locale): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('locales')
      .select('pay_details')
      .eq('name', locale)
      .single();
    
    if (error || !data) {
      console.error("Error fetching pay details:", error);
      return "";
    }
    
    return data.pay_details || "";
  } catch (err) {
    console.error("Error in getPayDetails:", err);
    return "";
  }
}

/**
 * Get the latest M1 template and populate it with job details
 */
export async function generateM1(firstName: string, title: string, compDesc: string, owner: string = ""): Promise<string> {
  try {
    // Fetch the latest M1 template from the database
    const { data, error } = await supabase
      .from('message_templates')
      .select('m1_template')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error("Error fetching M1 template:", error);
      // Fallback to a default template
      return `Hi ${firstName}!\n\nI'm ${owner} from The ITBC.\n\nYour background caught my eye.\n\nI have an open ${title} role at ${compDesc}\n\nInterested in learning more?\n\nBest,`;
    }
    
    // Replace placeholders in the template
    let message = data.m1_template
      .replace(/\[First Name\]/g, firstName)
      .replace(/\[Title\]/g, title)
      .replace(/\[Company Description\]/g, compDesc);
    
    // Replace [Owner] with the provided owner
    if (owner) {
      message = message.replace(/\[Owner\]/g, owner);
    } else {
      // If no owner is provided, replace [Owner] with empty string
      message = message.replace(/\[Owner\]/g, "");
    }
    
    return message;
  } catch (err) {
    console.error("Error generating M1:", err);
    // Fallback
    return `Hi ${firstName}!\n\nI'm ${owner} from The ITBC.\n\nYour background caught my eye.\n\nI have an open ${title} role at ${compDesc}\n\nInterested in learning more?\n\nBest,`;
  }
}

/**
 * Generate M2 message
 */
export async function generateM2(title: string, payDetails: string, workDetails: string, skills: string): Promise<string> {
  try {
    // Fetch the latest M2 template from the database
    const { data, error } = await supabase
      .from('message_templates')
      .select('m2_template')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error("Error fetching M2 template:", error);
      // Fallback to a default template
      return `Great to connect!\n\nHere's more about the ${title} role:\n\n${payDetails}\n\n${workDetails}\n\nSkills Sought:\n${skills}\n\nWould you be interested in this opportunity?`;
    }
    
    // Replace placeholders in the template
    const message = data.m2_template
      .replace(/\[Title\]/g, title)
      .replace(/\[Pay Details\]/g, payDetails)
      .replace(/\[Work Details\]/g, workDetails)
      .replace(/\[Skills\]/g, skills);
    
    return message;
  } catch (err) {
    console.error("Error generating M2:", err);
    // Fallback
    return `Great to connect!\n\nHere's more about the ${title} role:\n\n${payDetails}\n\n${workDetails}\n\nSkills Sought:\n${skills}\n\nWould you be interested in this opportunity?`;
  }
}

/**
 * Generate M3 message
 */
export async function generateM3(videoQuestions: string): Promise<string> {
  try {
    // Fetch the latest M3 template from the database
    const { data, error } = await supabase
      .from('message_templates')
      .select('m3_template')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error("Error fetching M3 template:", error);
      // Fallback to a default template
      return `Please record a short video (2-3 minutes) answering these questions:\n\n${videoQuestions}\n\nThis helps us get to know you better!`;
    }
    
    // Replace placeholders in the template
    const message = data.m3_template
      .replace(/\[Video Questions\]/g, videoQuestions);
    
    return message;
  } catch (err) {
    console.error("Error generating M3:", err);
    // Fallback
    return `Please record a short video (2-3 minutes) answering these questions:\n\n${videoQuestions}\n\nThis helps us get to know you better!`;
  }
}
