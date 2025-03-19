
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  candidateFacingTitle: z.string().min(1, "Title is required"),
  jd: z.string().min(1, "Job description is required"),
  status: z.string().min(1, "Status is required"),
  skillsSought: z.string().min(1, "Skills sought is required"),
  minSkills: z.string().min(1, "Minimum skills is required"),
  linkedinSearch: z.string().url("Must be a valid URL"),
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
  previewName: z.string().optional(),
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
      linkedinSearch: "",
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
      previewName: "Candidate",
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="Add New Job" 
          description="Create a new job posting with automated message templates."
        />
        <FormProvider {...methods}>
          <JobForm />
        </FormProvider>
      </main>
    </div>
  );
};

export default AddJob;
