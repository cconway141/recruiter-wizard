
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JobStatus, Locale, Flavor } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";

// Define the form schema for the job
const formSchema = z.object({
  candidateFacingTitle: z.string().min(1, "Title is required"),
  compDesc: z.string().min(1, "Company description is required"),
  locale: z.object({
    id: z.string(),
    name: z.string()
  }).or(z.string().min(1, "Locale is required")),
  flavor: z.object({
    id: z.string(),
    name: z.string()
  }).or(z.string().min(1, "Flavor is required")),
  status: z.object({
    id: z.string(),
    name: z.string()
  }).or(z.string().min(1, "Status is required")),
  jd: z.string().min(1, "Job description is required"),
  skillsSought: z.string().min(1, "Skills sought is required"),
  minSkills: z.string().optional(),
  lir: z.string().optional(),
  client: z.string().min(1, "Client is required"),
  rate: z.number().min(0),
  owner: z.string().min(1, "Owner is required"),
  date: z.string().optional(),
  other: z.string().optional(),
  videoQuestions: z.string().optional(),
  screeningQuestions: z.string().optional(),
  previewName: z.string().optional(),
  // These fields will be generated
  m1: z.string().optional(),
  m2: z.string().optional(),
  m3: z.string().optional(),
  workDetails: z.string().optional(),
  payDetails: z.string().optional(),
});

export function useJobFormSetup() {
  const [isLoading, setIsLoading] = useState(true);

  // Create form instance with default values
  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateFacingTitle: "",
      jd: "",
      status: { id: "", name: "Active" } as { id: string; name: JobStatus },
      skillsSought: "",
      minSkills: "",
      lir: "",
      client: "",
      compDesc: "",
      rate: 0,
      locale: { id: "", name: "Onshore" } as { id: string; name: Locale },
      owner: "",
      date: new Date().toISOString().split("T")[0],
      other: "",
      videoQuestions: "",
      screeningQuestions: "",
      flavor: { id: "", name: "FE" } as { id: string; name: Flavor },
      m1: "",
      m2: "",
      m3: "",
      workDetails: "",
      payDetails: "",
    },
    mode: "onSubmit"
  });

  // Simulate loading to match the pattern in the EditJob component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return { form, isLoading };
}
