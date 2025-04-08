
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

export function JobFormOtherInfo() {
  const form = useFormContext();
  
  return (
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
  );
}
