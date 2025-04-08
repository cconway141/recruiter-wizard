
import { supabase } from "@/integrations/supabase/client";
import { Locale } from "@/types/job";

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
