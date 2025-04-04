
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function JobFormQuestions() {
  const form = useFormContext();
  
  return (
    <>
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
    </>
  );
}
