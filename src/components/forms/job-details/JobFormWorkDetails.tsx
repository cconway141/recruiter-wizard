
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

export function JobFormWorkDetails() {
  const form = useFormContext();
  
  return (
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
  );
}
