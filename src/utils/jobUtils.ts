import { Job, Locale, DEFAULT_WORK_DETAILS, DEFAULT_PAY_DETAILS } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";

// Function to get locale abbreviations from database
export async function getLocaleAbbreviations(): Promise<Record<Locale, string>> {
  try {
    const { data, error } = await supabase
      .from("locales")
      .select("name, abbreviation");
    
    if (error) {
      console.error("Error fetching locale abbreviations:", error);
      // Fall back to default if there's an error
      return {
        "Onshore": "On",
        "Nearshore": "Near",
        "Offshore": "Off"
      };
    }
    
    const abbreviations: Record<string, string> = {};
    
    // Convert the database results to a record
    for (const locale of data || []) {
      if (locale.name && locale.abbreviation) {
        abbreviations[locale.name] = locale.abbreviation;
      }
    }
    
    // Ensure all locales have an abbreviation
    const result: Record<Locale, string> = {
      "Onshore": abbreviations["Onshore"] || "On",
      "Nearshore": abbreviations["Nearshore"] || "Near", 
      "Offshore": abbreviations["Offshore"] || "Off"
    };
    
    return result;
  } catch (error) {
    console.error("Error in getLocaleAbbreviations:", error);
    // Fall back to default if there's an exception
    return {
      "Onshore": "On",
      "Nearshore": "Near",
      "Offshore": "Off"
    };
  }
}

// Function to get role abbreviations from database
export async function getRoleAbbreviations(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("role_abbreviations")
      .select("role_name, abbreviation");
    
    if (error) {
      console.error("Error fetching role abbreviations:", error);
      // We'll return an empty object and the generateInternalTitle function will use DEV as default
      return {};
    }
    
    const abbreviations: Record<string, string> = {};
    
    // Convert the database results to a record
    for (const role of data || []) {
      if (role.role_name && role.abbreviation) {
        abbreviations[role.role_name] = role.abbreviation;
      }
    }
    
    return abbreviations;
  } catch (error) {
    console.error("Error in getRoleAbbreviations:", error);
    return {};
  }
}

export async function generateInternalTitle(client: string, title: string, flavor: string, locale: Locale): Promise<string> {
  // Get locale abbreviation
  const localeAbbreviations = await getLocaleAbbreviations();
  const localeAbbreviation = localeAbbreviations[locale];
  
  // Get role abbreviation
  const roleAbbreviations = await getRoleAbbreviations();
  // Get role abbreviation or default to "DEV" if not found
  const roleAbbreviation = roleAbbreviations[title] || "DEV";
  
  return `${client} ${roleAbbreviation} - ${flavor} ${localeAbbreviation}`;
}

export function calculateRates(baseRate: number): { high: number; medium: number; low: number } {
  return {
    high: Math.round(baseRate * 0.55),
    medium: Math.round(baseRate * 0.4),
    low: Math.round(baseRate * 0.2)
  };
}

export async function getWorkDetails(locale: Locale): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("locales")
      .select("work_details")
      .eq("name", locale)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching work details:", error);
      // Fallback to default if database lookup fails
      return DEFAULT_WORK_DETAILS[locale];
    }
    
    if (!data || !data.work_details) {
      // Fallback to default if data is empty
      return DEFAULT_WORK_DETAILS[locale];
    }
    
    return data.work_details;
  } catch (error) {
    console.error("Error fetching work details:", error);
    return DEFAULT_WORK_DETAILS[locale];
  }
}

export async function getPayDetails(locale: Locale): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("locales")
      .select("pay_details")
      .eq("name", locale)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching pay details:", error);
      // Fallback to default if database lookup fails
      return DEFAULT_PAY_DETAILS[locale];
    }
    
    if (!data || !data.pay_details) {
      // Fallback to default if data is empty
      return DEFAULT_PAY_DETAILS[locale];
    }
    
    return data.pay_details;
  } catch (error) {
    console.error("Error fetching pay details:", error);
    return DEFAULT_PAY_DETAILS[locale];
  }
}

// Default templates as fallbacks
const DEFAULT_M1_TEMPLATE = `Hi [First Name]!

I'm [Owner] from The ITBC.

Your background caught my eye.

I have an open [Title] role at [Company Description]

Interested in learning more?

Best,`;

const DEFAULT_M2_TEMPLATE = `Great! Here is some more information.

I founded The ITBC ~ 10 years ago, today we specialize in placing candidates in targeted IT project roles as a staffing firm. I have a few messages I'll send starting with this one, each requiring a response from you.

For this opening:
[Title] Role
[Pay Details]

Working Details:
[Work Details]

If that works, please review the skills below and reply with:
1) Years of hands-on experience
2) Expertise level for each skill

[Skills Sought]

For level choose from beginner, advanced beginner, intermediate, advanced, and expert.

Below that, please share your rate expectations.`;

const DEFAULT_M3_TEMPLATE = `Awesome! To expedite things as I think you are a strong fit, could you record a brief intro video focusing on the skills mentioned and real project examples (only I will see it)?
    
Please also touch on:
[Video Questions]

Upload the video and share the link here.

Additionally, please send me the following:
- Interview availability
- Notice period if offered
- Email
- WhatsApp number
- Updated resume/LinkedIn
- Hourly rate in USD

I'll also be sending you a right-to-represent document so we can proceed.`;

async function getMessageTemplate(templateField: string, defaultTemplate: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('message_templates' as any)
      .select(templateField)
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching ${templateField}:`, error);
      return defaultTemplate;
    }
    
    if (!data || !data[templateField]) {
      return defaultTemplate;
    }
    
    return data[templateField];
  } catch (error) {
    console.error(`Error fetching ${templateField}:`, error);
    return defaultTemplate;
  }
}

export async function generateM1(firstName: string, title: string, compDesc: string, owner: string = ""): Promise<string> {
  const template = await getMessageTemplate('m1_template', DEFAULT_M1_TEMPLATE);
  
  return template
    .replace(/\[First Name\]/g, firstName)
    .replace(/\[Title\]/g, title)
    .replace(/\[Company Description\]/g, compDesc)
    .replace(/\[Owner\]/g, owner);
}

export async function generateM2(title: string, payDetails: string, workDetails: string, skillsSought: string): Promise<string> {
  const template = await getMessageTemplate('m2_template', DEFAULT_M2_TEMPLATE);
  
  return template
    .replace(/\[Title\]/g, title)
    .replace(/\[Pay Details\]/g, payDetails)
    .replace(/\[Work Details\]/g, workDetails)
    .replace(/\[Skills Sought\]/g, skillsSought);
}

export async function generateM3(videoQuestions: string): Promise<string> {
  const template = await getMessageTemplate('m3_template', DEFAULT_M3_TEMPLATE);
  
  return template.replace(/\[Video Questions\]/g, videoQuestions);
}
