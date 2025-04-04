
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function JobFormLinks() {
  const form = useFormContext();
  
  return (
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
  );
}
