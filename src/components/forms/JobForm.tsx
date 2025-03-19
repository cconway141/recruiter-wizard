import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Job, JobStatus, Locale, Flavor, JOB_TITLES } from "@/types/job";
import { calculateRates, generateInternalTitle, getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";
import { useJobs } from "@/contexts/JobContext";
import { MessageCard } from "@/components/messages/MessageCard";

interface JobFormProps {
  job?: Job;
  isEditing?: boolean;
}

export function JobForm({ job, isEditing = false }: JobFormProps) {
  const { addJob, updateJob } = useJobs();
  const navigate = useNavigate();
  const [previewTitle, setPreviewTitle] = useState("");
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: "",
  });

  const form = useFormContext();
  const watchedFields = form.watch();

  useEffect(() => {
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      const newTitle = generateInternalTitle(
        watchedFields.client,
        watchedFields.candidateFacingTitle,
        watchedFields.flavor,
        watchedFields.locale as Locale
      );
      setPreviewTitle(newTitle);
    }

    if (watchedFields.candidateFacingTitle && watchedFields.compDesc && watchedFields.locale && watchedFields.skillsSought && watchedFields.videoQuestions) {
      const locale = watchedFields.locale as Locale;
      const workDetails = getWorkDetails(locale);
      const payDetails = getPayDetails(locale);
      
      const m1 = generateM1("[First Name]", watchedFields.candidateFacingTitle, watchedFields.compDesc);
      const m2 = generateM2(watchedFields.candidateFacingTitle, payDetails, workDetails, watchedFields.skillsSought);
      const m3 = generateM3(watchedFields.videoQuestions);
      
      setMessages({ m1, m2, m3 });
    }
  }, [watchedFields]);

  const onSubmit = (values: any) => {
    const { previewName, ...jobData } = values;
    
    const { high, medium, low } = calculateRates(values.rate);
    
    const locale = values.locale as Locale;
    const workDetails = getWorkDetails(locale);
    const payDetails = getPayDetails(locale);
    
    const internalTitle = generateInternalTitle(
      values.client,
      values.candidateFacingTitle,
      values.flavor,
      locale
    );
    
    if (isEditing && job) {
      updateJob({
        ...job,
        ...jobData,
        locale: jobData.locale as Locale,
        status: jobData.status as JobStatus,
        flavor: jobData.flavor as Flavor,
        internalTitle,
        highRate: high,
        mediumRate: medium,
        lowRate: low,
        workDetails,
        payDetails,
        m1: messages.m1,
        m2: messages.m2,
        m3: messages.m3
      });
    } else {
      addJob({
        jd: jobData.jd,
        candidateFacingTitle: jobData.candidateFacingTitle,
        status: jobData.status as JobStatus,
        skillsSought: jobData.skillsSought,
        minSkills: jobData.minSkills, 
        linkedinSearch: jobData.linkedinSearch,
        lir: jobData.lir,
        client: jobData.client,
        compDesc: jobData.compDesc,
        rate: jobData.rate,
        locale: jobData.locale as Locale,
        owner: jobData.owner,
        date: jobData.date,
        other: jobData.other || "",
        videoQuestions: jobData.videoQuestions,
        screeningQuestions: jobData.screeningQuestions,
        flavor: jobData.flavor as Flavor,
      });
    }
    
    navigate("/");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="candidateFacingTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JOB_TITLES.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="flavor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flavor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select flavor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FE">FE (Frontend)</SelectItem>
                      <SelectItem value="BE">BE (Backend)</SelectItem>
                      <SelectItem value="FS">FS (Full Stack)</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="ML">ML (Machine Learning)</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Onshore">Onshore</SelectItem>
                      <SelectItem value="Nearshore">Nearshore</SelectItem>
                      <SelectItem value="Offshore">Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Aquarium">Aquarium</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recruiter (Owner)</FormLabel>
                  <FormControl>
                    <Input placeholder="Recruiter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (US Onshore $/hr)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      placeholder="Hourly rate" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="compDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the client company"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This appears in the M1 message to candidates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="jd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full job description"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="skillsSought"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Sought</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List required skills (one per line)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These skills will appear in the M2 message to candidates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="minSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Skills Block</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Format: Skill (Level, Years)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Structured format: Skill (Level, Years)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="linkedinSearch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Search URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.linkedin.com/search/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Recruiter Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.linkedin.com/talent/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="videoQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Questions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Questions for video interview"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These will appear in the M3 message.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="screeningQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Screening Questions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Questions for initial screening call"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Requirements (Nice to Have)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional or nice-to-have requirements"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="border-l pl-8">
        <div className="sticky top-8">
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          
          {previewTitle && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500">Internal Title:</h4>
              <p className="text-md font-semibold">{previewTitle}</p>
            </div>
          )}
          
          {watchedFields.rate > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">High Rate</h4>
                <p className="text-lg font-semibold">${Math.round(watchedFields.rate * 0.55)}/hr</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">Medium Rate</h4>
                <p className="text-lg font-semibold">${Math.round(watchedFields.rate * 0.4)}/hr</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">Low Rate</h4>
                <p className="text-lg font-semibold">${Math.round(watchedFields.rate * 0.2)}/hr</p>
              </div>
            </div>
          )}
          
          <FormField
            control={form.control}
            name="previewName"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Preview Name (for messages)</FormLabel>
                <FormControl>
                  <Input placeholder="Candidate name for preview" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 mb-2">Message Previews</h4>
            
            {messages.m1 && (
              <MessageCard
                title="M1 - Initial Outreach"
                message={messages.m1}
                previewName={form.watch("previewName")}
              />
            )}
            
            {messages.m2 && (
              <MessageCard
                title="M2 - Detailed Information"
                message={messages.m2}
                previewName={form.watch("previewName")}
              />
            )}
            
            {messages.m3 && (
              <MessageCard
                title="M3 - Video & Final Questions"
                message={messages.m3}
                previewName={form.watch("previewName")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
