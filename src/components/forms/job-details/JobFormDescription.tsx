
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

export function JobFormDescription() {
  const form = useFormContext();
  
  return (
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
  );
}
