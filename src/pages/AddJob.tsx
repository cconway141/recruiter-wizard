
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobProvider } from "@/contexts/JobContext";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { z } from "zod";

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

const AddJob = () => {
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateFacingTitle: "",
      jd: "",
      status: { id: "", name: "Active" },
      skillsSought: "",
      minSkills: "",
      lir: "",
      client: "",
      compDesc: "",
      rate: 0,
      locale: { id: "", name: "Onshore" },
      owner: "",
      date: new Date().toISOString().split("T")[0],
      other: "",
      videoQuestions: "",
      screeningQuestions: "",
      flavor: { id: "", name: "FE" },
      m1: "",
      m2: "",
      m3: "",
      workDetails: "",
      payDetails: "",
    },
    mode: "onSubmit" // Explicitly set to onSubmit to ensure validation runs at submission time
  });

  // For debugging
  useEffect(() => {
    console.log("Form state:", methods.formState);
    const subscription = methods.watch((_, { name }) => {
      if (name) console.log(`Form value changed: ${name}`);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Add New Job" 
          description="Create a new job posting with automated message templates."
        />
        <JobProvider>
          <FormProvider {...methods}>
            <JobForm />
          </FormProvider>
        </JobProvider>
      </main>
      <Toaster />
    </div>
  );
};

export default AddJob;
