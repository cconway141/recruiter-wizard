
import { Job, Locale, DEFAULT_WORK_DETAILS, DEFAULT_PAY_DETAILS } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";

// Update Role to abbreviation mapping
export const ROLE_ABBREVIATIONS: Record<string, string> = {
  "Account Manager": "AM",
  "Business Analyst": "BA",
  "Classroom TA": "TA",
  "Cyber & Compliance Consultant": "DEV",
  "Dev Ops Engineer": "DOP",
  "Entry Level Developer": "DEV",
  "Full Stack Engineer": "DEV",
  "Lead Engineer": "DEV",
  "AI-Driven Marketing Integration Specialist": "MKT",
  "Operations Specialist": "OPS",
  "Power BI Engineer": "PBI",
  "Product Manager": "PDM",
  "Product Owner": "PO",
  "Quality Assurance Analyst": "QA",
  "Marketing Integrator": "MKT",
  "Sr. Android Developer": "DEV",
  "Sales & Marketing": "MKT",
  "SharePoint Specialist": "DEV",
  "Social Media Manager": "MKT",
  "Software Engineer": "DEV",
  "Sr. Business Analyst": "BA",
  "Sr. Data Engineer": "DEV",
  "Sr. Data Modeler": "DEV",
  "Sr. Engineer": "DEV",
  "Sr. Full Stack Engineer": "DEV",
  "Sr. iOS Engineer": "DEV",
  "Sr. IT Recruiter": "REC",
  "Sr. Java Engineer": "DEV",
  "Sr. Performance Marketer": "MKT",
  "Sr. Scrum Master": "SM",
  "Agile Coach": "AGC",
  "Fractional CTO": "fCTO",
  "UI/UX Designer": "UIUX",
  "QA": "QA",
  "Power Apps Engineer": "DEV",
  "Frontend Developer": "DEV",
  "Backend Developer": "DEV",
  "Full Stack Developer": "DEV",
  "Mobile Developer": "DEV",
  "DevOps Engineer": "DOP",
  "Data Engineer": "DEV",
  "Machine Learning Engineer": "DEV",
};

// Locale to abbreviation mapping
export const LOCALE_ABBREVIATIONS: Record<Locale, string> = {
  "Onshore": "On",
  "Nearshore": "Near",
  "Offshore": "Off"
};

export function generateInternalTitle(client: string, title: string, flavor: string, locale: Locale): string {
  // Get role abbreviation or default to "DEV" if not found
  const roleAbbreviation = ROLE_ABBREVIATIONS[title] || "DEV";
  
  // Get locale abbreviation
  const localeAbbreviation = LOCALE_ABBREVIATIONS[locale];
  
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

I'm from The ITBC.

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
      .from('message_templates')
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

export async function generateM1(firstName: string, title: string, compDesc: string): Promise<string> {
  const template = await getMessageTemplate('m1_template', DEFAULT_M1_TEMPLATE);
  
  return template
    .replace(/\[First Name\]/g, firstName)
    .replace(/\[Title\]/g, title)
    .replace(/\[Company Description\]/g, compDesc);
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
