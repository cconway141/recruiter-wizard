
import { Job, Locale, DEFAULT_WORK_DETAILS, DEFAULT_PAY_DETAILS } from "@/types/job";

export function generateInternalTitle(client: string, title: string, flavor: string, locale: Locale): string {
  return `${client} ${title} - ${flavor} ${locale}`;
}

export function calculateRates(baseRate: number): { high: number; medium: number; low: number } {
  return {
    high: Math.round(baseRate * 0.55),
    medium: Math.round(baseRate * 0.4),
    low: Math.round(baseRate * 0.2)
  };
}

export function getWorkDetails(locale: Locale): string {
  return DEFAULT_WORK_DETAILS[locale];
}

export function getPayDetails(locale: Locale): string {
  return DEFAULT_PAY_DETAILS[locale];
}

export function generateM1(firstName: string, title: string, compDesc: string): string {
  return `Hi ${firstName}!

I'm from The ITBC.

Your background caught my eye.

I have an open ${title} role at ${compDesc}.

Interested in learning more?

Best,`;
}

export function generateM2(title: string, payDetails: string, workDetails: string, skillsSought: string): string {
  return `Great! Here is some more information.

I founded The ITBC ~ 10 years ago, today we specialize in placing candidates in targeted IT project roles as a staffing firm. I have a few messages I'll send starting with this one, each requiring a response from you.

For this opening:
${title} Role
${payDetails}

Working Details:
${workDetails}

If that works, please review the skills below and reply with:
1) Years of hands-on experience
2) Expertise level for each skill

${skillsSought}

For level choose from beginner, advanced beginner, intermediate, advanced, and expert.

Below that, please share your rate expectations.`;
}

export function generateM3(videoQuestions: string): string {
  return `Awesome! To expedite things as I think you are a strong fit, could you record a brief intro video focusing on the skills mentioned and real project examples (only I will see it)?
    
Please also touch on:
${videoQuestions}

Upload the video and share the link here.

Additionally, please send me the following:
- Interview availability
- Notice period if offered
- Email
- WhatsApp number
- Updated resume/LinkedIn
- Hourly rate in USD

I'll also be sending you a right-to-represent document so we can proceed.`;
}
