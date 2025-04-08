
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobProvider } from "@/contexts/JobContext";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

// Define the form schema for the job
const formSchema = z.object({
  candidateFacingTitle: z.string().min(1, "Title is required"),
  jd: z.string().min(1, "Job description is required"),
  status: z.string().min(1, "Status is required"),
  skillsSought: z.string().min(1, "Skills sought is required"),
  minSkills: z.string().min(1, "Minimum skills is required"),
  lir: z.string().url("Must be a valid URL"),
  client: z.string().min(1, "Client is required"),
  compDesc: z.string().min(1, "Company description is required"),
  rate: z.number().min(1, "Rate is required"),
  locale: z.string().min(1, "Locale is required"),
  owner: z.string().min(1, "Owner is required"),
  date: z.string().min(1, "Date is required"),
  other: z.string().optional(),
  videoQuestions: z.string().min(1, "Video questions are required"),
  screeningQuestions: z.string().min(1, "Screening questions are required"),
  flavor: z.string().min(1, "Flavor is required"),
  // These fields are required for the form but will be generated
  m1: z.string().optional(),
  m2: z.string().optional(),
  m3: z.string().optional(),
  workDetails: z.string().optional(),
  payDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddJob = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateFacingTitle: "",
      jd: "",
      status: "Active",
      skillsSought: "",
      minSkills: "",
      lir: "",
      client: "",
      compDesc: "",
      rate: 0,
      locale: "Onshore",
      owner: "",
      date: new Date().toISOString().split("T")[0],
      other: "",
      videoQuestions: "",
      screeningQuestions: "",
      flavor: "FE",
      m1: "",
      m2: "",
      m3: "",
      workDetails: "",
      payDetails: "",
    }
  });

  // For debugging
  useEffect(() => {
    console.log("Form state:", methods.formState);
    const subscription = methods.watch(() => {
      console.log("Form values changed:", methods.getValues());
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
