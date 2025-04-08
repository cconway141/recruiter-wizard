import { supabase } from "@/integrations/supabase/client";
import { Locale } from "@/types/job";
import { generateInternalTitle, getRoleAbbreviation, getAllRoleAbbreviations } from "./titleUtils";

// Re-export the title utilities to maintain backward compatibility
export { generateInternalTitle, getRoleAbbreviation, getAllRoleAbbreviations };

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
      .replace(/\[Skills Sought\]/g, skills)
      .replace(/\[Skills\]/g, skills); // Add this line to handle both [Skills Sought] and [Skills]
    
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
