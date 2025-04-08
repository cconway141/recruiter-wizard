
import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function JobFormDescription() {
  const form = useFormContext();
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);

  const extractSkillsFromDescription = async (description: string) => {
    if (!description.trim()) return;
    
    setIsGeneratingSkills(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: { jobDescription: description },
      });

      if (error) throw error;

      // Update the skills field with the generated content
      if (data?.skills) {
        form.setValue('skillsSought', data.skills, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        toast({
          title: "Skills extracted",
          description: "Skills have been automatically extracted from the job description.",
        });
      }
    } catch (error) {
      console.error("Error extracting skills:", error);
      toast({
        title: "Error extracting skills",
        description: "Could not extract skills from the job description.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSkills(false);
    }
  };

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
                onBlur={(e) => {
                  field.onBlur();
                  extractSkillsFromDescription(e.target.value);
                }}
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
              <FormLabel className="flex items-center gap-2">
                Skills Sought
                {isGeneratingSkills && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </FormLabel>
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
