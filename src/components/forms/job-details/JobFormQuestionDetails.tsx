
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Loader2, Check } from "lucide-react";

export function JobFormQuestionDetails() {
  const form = useFormContext();
  const videoQuestionsValue = form.watch("videoQuestions");
  const isVideoQuestionsGenerated = videoQuestionsValue && videoQuestionsValue.trim().length > 0;
  
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
            <FormLabel>Screening Questions</FormLabel>
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
