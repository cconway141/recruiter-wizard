export type JobStatus = "Active" | "Aquarium" | "Inactive" | "Closed";
export type Locale = "Onshore" | "Nearshore" | "Offshore";
export type Flavor = "FE" | "BE" | "FS" | "DevOps" | "Data" | "ML" | "Mobile" | "Other";

// Define updated interface for locale objects
export interface LocaleObject {
  id: string;
  name: string;
  /** Two-letter code, e.g. "US" */
  abbreviation?: string;
  /** Default "work details" text for this locale */
  workDetails?: string;
  /** Default "pay details" text for this locale */
  payDetails?: string;
}

// Define updated interface for flavor objects
export interface FlavorObject {
  id: string;
  name: string;
  label?: string; // Optional for transition
}

// Define updated interface for status objects
export interface StatusObject {
  id: string;
  name: JobStatus | string;
}

export interface Job {
  id: string;
  internalTitle: string;
  candidateFacingTitle: string;
  jd: string;
  status: StatusObject;
  statusId?: string;
  m1: string;
  m2: string;
  m3: string;
  skillsSought: string;
  minSkills: string;
  linkedinSearch: string;
  lir: string;
  client: string;
  clientId: string;
  compDesc: string;
  rate: number;
  highRate: number;
  mediumRate: number;
  lowRate: number;
  locale: LocaleObject;
  localeId: string;
  owner: string;
  ownerId: string;
  date: string;
  workDetails: string;
  payDetails: string;
  other: string;
  videoQuestions: string;
  screeningQuestions: string;
  flavor: FlavorObject | string; // Keeping for transition
  flavorId: string;
}

export const DEFAULT_WORK_DETAILS: Record<Locale, string> = {
  Onshore: "100% remote work with US hours (typically 9am-5pm EST). Weekly team meetings and check-ins.",
  Nearshore: "100% remote work with some overlap with US hours. Weekly team meetings during overlap hours.",
  Offshore: "100% remote work with at least 4 hours of overlap with EST business hours required. Weekly team meetings during overlap hours."
};

export const DEFAULT_PAY_DETAILS: Record<Locale, string> = {
  Onshore: "W2 employment with standard benefits. Hourly rate paid bi-weekly.",
  Nearshore: "Contract-to-hire potential. Paid hourly in USD via wire transfer.",
  Offshore: "Initial 3-month contract with extension opportunities. Paid hourly in USD monthly."
};

export const JOB_TITLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "QA Engineer",
  "Technical Lead"
];
