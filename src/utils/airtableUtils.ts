
/**
 * Utility functions for interacting with the Airtable API
 */

import { Job, Locale, JobStatus, Flavor } from "@/types/job";
import { Candidate } from "@/components/candidates/CandidateEntry";

const AIRTABLE_API_KEY = ""; // This should be provided by the user
const AIRTABLE_BASE_ID = ""; // This should be provided by the user
const JOBS_TABLE_NAME = "Jobs";
const CANDIDATES_TABLE_NAME = "Candidates";

export const setupAirtable = (apiKey: string, baseId: string) => {
  localStorage.setItem("airtable_api_key", apiKey);
  localStorage.setItem("airtable_base_id", baseId);
};

export const getAirtableConfig = () => {
  return {
    apiKey: localStorage.getItem("airtable_api_key") || "",
    baseId: localStorage.getItem("airtable_base_id") || "",
  };
};

export const isAirtableConfigured = () => {
  const { apiKey, baseId } = getAirtableConfig();
  return apiKey !== "" && baseId !== "";
};

// Function to fetch all jobs from Airtable
export const fetchJobsFromAirtable = async (): Promise<Job[]> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return [];
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${JOBS_TABLE_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map Airtable records to our Job format
    return data.records.map((record: any) => {
      const fields = record.fields;
      return {
        id: record.id,
        internalTitle: fields.internalTitle || "",
        jd: fields.jd || "",
        candidateFacingTitle: fields.candidateFacingTitle || "",
        status: fields.status as JobStatus,
        m1: fields.m1 || "",
        m2: fields.m2 || "",
        m3: fields.m3 || "",
        skillsSought: fields.skillsSought || "",
        minSkills: fields.minSkills || "",
        lir: fields.lir || "",
        client: fields.client || "",
        compDesc: fields.compDesc || "",
        rate: parseFloat(fields.rate) || 0,
        highRate: parseFloat(fields.highRate) || 0,
        mediumRate: parseFloat(fields.mediumRate) || 0,
        lowRate: parseFloat(fields.lowRate) || 0,
        locale: fields.locale as Locale,
        owner: fields.owner || "",
        date: fields.date || "",
        workDetails: fields.workDetails || "",
        payDetails: fields.payDetails || "",
        other: fields.other || "",
        videoQuestions: fields.videoQuestions || "",
        screeningQuestions: fields.screeningQuestions || "",
        flavor: fields.flavor as Flavor
      };
    });
  } catch (error) {
    console.error("Error fetching jobs from Airtable:", error);
    return [];
  }
};

// Function to fetch candidates for a specific job
export const fetchCandidatesFromAirtable = async (jobId: string): Promise<Candidate[]> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return [];
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${CANDIDATES_TABLE_NAME}?filterByFormula={jobId}="${jobId}"`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map Airtable records to our Candidate format
    return data.records.map((record: any) => {
      const fields = record.fields;
      return {
        id: record.id,
        name: fields.name || "",
        status: {
          approved: fields.approved === "true" || fields.approved === true,
          preparing: fields.preparing === "true" || fields.preparing === true,
          submitted: fields.submitted === "true" || fields.submitted === true,
          interviewing: fields.interviewing === "true" || fields.interviewing === true,
          offered: fields.offered === "true" || fields.offered === true
        }
      };
    });
  } catch (error) {
    console.error("Error fetching candidates from Airtable:", error);
    return [];
  }
};

// Add a job to Airtable
export const addJobToAirtable = async (job: Job): Promise<string | null> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return null;
    }

    // Format the job for Airtable
    const formattedJob = {
      fields: {
        internalTitle: job.internalTitle,
        jd: job.jd,
        candidateFacingTitle: job.candidateFacingTitle,
        status: job.status,
        m1: job.m1,
        m2: job.m2,
        m3: job.m3,
        skillsSought: job.skillsSought,
        minSkills: job.minSkills,
        lir: job.lir,
        client: job.client,
        compDesc: job.compDesc,
        rate: job.rate,
        highRate: job.highRate,
        mediumRate: job.mediumRate,
        lowRate: job.lowRate,
        locale: job.locale,
        owner: job.owner,
        date: job.date,
        workDetails: job.workDetails,
        payDetails: job.payDetails,
        other: job.other,
        videoQuestions: job.videoQuestions,
        screeningQuestions: job.screeningQuestions,
        flavor: job.flavor
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${JOBS_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedJob),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add job: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Return the Airtable record ID
  } catch (error) {
    console.error("Error adding job to Airtable:", error);
    return null;
  }
};

// Update a job in Airtable
export const updateJobInAirtable = async (job: Job): Promise<boolean> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return false;
    }

    // Format the job for Airtable
    const formattedJob = {
      fields: {
        internalTitle: job.internalTitle,
        jd: job.jd,
        candidateFacingTitle: job.candidateFacingTitle,
        status: job.status,
        m1: job.m1,
        m2: job.m2,
        m3: job.m3,
        skillsSought: job.skillsSought,
        minSkills: job.minSkills,
        lir: job.lir,
        client: job.client,
        compDesc: job.compDesc,
        rate: job.rate,
        highRate: job.highRate,
        mediumRate: job.mediumRate,
        lowRate: job.lowRate,
        locale: job.locale,
        owner: job.owner,
        date: job.date,
        workDetails: job.workDetails,
        payDetails: job.payDetails,
        other: job.other,
        videoQuestions: job.videoQuestions,
        screeningQuestions: job.screeningQuestions,
        flavor: job.flavor
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${JOBS_TABLE_NAME}/${job.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedJob),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update job: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating job in Airtable:", error);
    return false;
  }
};

// Delete a job from Airtable
export const deleteJobFromAirtable = async (jobId: string): Promise<boolean> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return false;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${JOBS_TABLE_NAME}/${jobId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting job from Airtable:", error);
    return false;
  }
};

// Add a candidate to Airtable
export const addCandidateToAirtable = async (jobId: string, candidate: Candidate): Promise<string | null> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return null;
    }

    // Format the candidate for Airtable
    const formattedCandidate = {
      fields: {
        jobId: jobId,
        name: candidate.name,
        approved: candidate.status.approved,
        preparing: candidate.status.preparing,
        submitted: candidate.status.submitted,
        interviewing: candidate.status.interviewing,
        offered: candidate.status.offered
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${CANDIDATES_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedCandidate),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add candidate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Return the Airtable record ID
  } catch (error) {
    console.error("Error adding candidate to Airtable:", error);
    return null;
  }
};

// Update a candidate in Airtable
export const updateCandidateInAirtable = async (jobId: string, candidate: Candidate): Promise<boolean> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return false;
    }

    // Format the candidate for Airtable
    const formattedCandidate = {
      fields: {
        jobId: jobId,
        name: candidate.name,
        approved: candidate.status.approved,
        preparing: candidate.status.preparing,
        submitted: candidate.status.submitted,
        interviewing: candidate.status.interviewing,
        offered: candidate.status.offered
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${CANDIDATES_TABLE_NAME}/${candidate.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedCandidate),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update candidate: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating candidate in Airtable:", error);
    return false;
  }
};

// Delete a candidate from Airtable
export const deleteCandidateFromAirtable = async (candidateId: string): Promise<boolean> => {
  try {
    const { apiKey, baseId } = getAirtableConfig();
    
    if (!apiKey || !baseId) {
      console.error("Airtable not configured");
      return false;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${CANDIDATES_TABLE_NAME}/${candidateId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete candidate: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting candidate from Airtable:", error);
    return false;
  }
};
