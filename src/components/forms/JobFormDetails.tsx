
import { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Locale } from "@/types/job";
import { getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";

export interface JobFormValues {
  candidateFacingTitle: string;
  compDesc: string;
  locale: string;
  skillsSought: string;
  videoQuestions: string;
  workDetails: string;
  payDetails: string;
  jd: string;
  minSkills: string;
  other: string;
  screeningQuestions: string;
  m1: string;
  m2: string;
  m3: string;
  [key: string]: any;
}

interface JobFormDetailsProps {
  form: UseFormReturn<JobFormValues>;
}

export function JobFormDetails({ form }: JobFormDetailsProps) {
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const watchedFields = {
    candidateFacingTitle: form.watch("candidateFacingTitle"),
    compDesc: form.watch("compDesc"),
    locale: form.watch("locale"),
    skillsSought: form.watch("skillsSought"),
    videoQuestions: form.watch("videoQuestions")
  };

  useEffect(() => {
    const updateMessages = async () => {
      if (watchedFields.candidateFacingTitle && watchedFields.compDesc && watchedFields.locale && watchedFields.skillsSought && watchedFields.videoQuestions) {
        try {
          setIsLoading(true);
          const locale = watchedFields.locale as Locale;
          const workDetails = await getWorkDetails(locale);
          const payDetails = await getPayDetails(locale);
          
          // Update the form values with the fetched details
          form.setValue("workDetails", workDetails);
          form.setValue("payDetails", payDetails);
          
          const m1 = generateM1("[First Name]", watchedFields.candidateFacingTitle, watchedFields.compDesc);
          const m2 = generateM2(watchedFields.candidateFacingTitle, payDetails, workDetails, watchedFields.skillsSought);
          const m3 = generateM3(watchedFields.videoQuestions);
          
          setMessages({ m1, m2, m3 });
          
          // Update the form values with the generated messages
          form.setValue("m1", m1);
          form.setValue("m2", m2);
          form.setValue("m3", m3);
        } catch (err) {
          console.error("Error generating messages:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    updateMessages();
  }, [watchedFields, form]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="jd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the full job description"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="skillsSought"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills Sought</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List the required skills"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List the minimum required skills"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="workDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Details about the work arrangement"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Details about the payment structure"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="videoQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Questions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Questions for the candidate's video response"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="screeningQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Screening Questions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Questions for initial screening"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="other"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Information</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any other relevant information"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="m1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="m1">Message 1</TabsTrigger>
              <TabsTrigger value="m2">Message 2</TabsTrigger>
              <TabsTrigger value="m3">Message 3</TabsTrigger>
            </TabsList>
            <TabsContent value="m1" className="pt-4">
              <FormField
                control={form.control}
                name="m1"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="First message to candidate"
                        className="min-h-[200px]"
                        {...field}
                        value={field.value || messages.m1}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="m2" className="pt-4">
              <FormField
                control={form.control}
                name="m2"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Second message to candidate"
                        className="min-h-[200px]"
                        {...field}
                        value={field.value || messages.m2}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="m3" className="pt-4">
              <FormField
                control={form.control}
                name="m3"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Third message to candidate"
                        className="min-h-[200px]"
                        {...field}
                        value={field.value || messages.m3}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
