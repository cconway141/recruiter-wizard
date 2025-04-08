
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
  
  if (!form || !form.control) {
    return null; // Return early if form context isn't available
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
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
