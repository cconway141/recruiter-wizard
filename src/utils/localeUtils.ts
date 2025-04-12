
import { supabase } from "@/integrations/supabase/client";
import { Locale, DEFAULT_WORK_DETAILS, DEFAULT_PAY_DETAILS } from "@/types/job";

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
      return DEFAULT_WORK_DETAILS[locale] || "";
    }
    
    return data.work_details || DEFAULT_WORK_DETAILS[locale] || "";
  } catch (err) {
    console.error("Error in getWorkDetails:", err);
    return DEFAULT_WORK_DETAILS[locale] || "";
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
      return DEFAULT_PAY_DETAILS[locale] || "";
    }
    
    return data.pay_details || DEFAULT_PAY_DETAILS[locale] || "";
  } catch (err) {
    console.error("Error in getPayDetails:", err);
    return DEFAULT_PAY_DETAILS[locale] || "";
  }
}
