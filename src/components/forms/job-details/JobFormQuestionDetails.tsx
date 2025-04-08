
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function JobFormQuestionDetails() {
  const form = useFormContext();
  const [isGeneratingScreeningQuestions, setIsGeneratingScreeningQuestions] = useState(false);
  const videoQuestionsValue = form.watch("videoQuestions");
  const minSkillsValue = form.watch("minSkills");
  const isVideoQuestionsGenerated = videoQuestionsValue && videoQuestionsValue.trim().length > 0;
  const [screeningQuestionsGenerated, setScreeningQuestionsGenerated] = useState(false);

  // Generate screening questions when video questions are populated
  useEffect(() => {
    const generateScreeningQuestions = async () => {
      if (videoQuestionsValue && minSkillsValue && !isGeneratingScreeningQuestions) {
        setIsGeneratingScreeningQuestions(true);
        try {
          const { data, error } = await supabase.functions.invoke('generate-screening-questions', {
            body: { minSkills: minSkillsValue }
          });

          if (error) throw error;

          if (data?.screeningQuestions) {
            form.setValue('screeningQuestions', data.screeningQuestions, { 
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true 
            });
            setScreeningQuestionsGenerated(true);
            toast({
              title: "Screening questions generated",
              description: "Screening questions have been automatically generated based on the skills.",
            });
          }
        } catch (error) {
          console.error("Error generating screening questions:", error);
          toast({
            title: "Error generating screening questions",
            description: "Could not generate screening questions from the skills.",
            variant: "destructive",
          });
        } finally {
          setIsGeneratingScreeningQuestions(false);
        }
      }
    };

    generateScreeningQuestions();
  }, [videoQuestionsValue, minSkillsValue, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="videoQuestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Video Questions
              {isVideoQuestionsGenerated && (
                <span className="flex items-center text-green-500 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  Success!
                </span>
              )}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Questions for the candidate's video response"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              These questions will be included in the video instructions message (M3).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="screeningQuestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Screening Questions
              {isGeneratingScreeningQuestions && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              )}
              {screeningQuestionsGenerated && !isGeneratingScreeningQuestions && (
                <span className="flex items-center text-green-500 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  Success!
                </span>
              )}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Questions for initial screening"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              These questions will be used during the initial candidate screening.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
