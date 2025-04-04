
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

export function JobFormCompanyDesc() {
  const form = useFormContext();
  
  return (
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
  );
}
