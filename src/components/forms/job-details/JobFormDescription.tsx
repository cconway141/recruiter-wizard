
import { useRef } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Loader2, Check, RefreshCw, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFieldsGenerator } from "@/hooks/job-form/useFieldsGenerator";
import { JobFormValues } from "../JobFormDetails";

export function JobFormDescription() {
  const form = useFormContext<JobFormValues>();
  const { 
    generateSkills, 
    generateMinSkills, 
    generateVideoQuestions, 
    generateAllFields,
    generationState 
  } = useFieldsGenerator(form);
  
  const { isGenerating, generatedFields } = generationState;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold">Job Description</h3>
        <Button
          type="button"
          size="sm"
          onClick={generateAllFields}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Generate All Fields"}
        </Button>
      </div>
      
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
                <FormLabel className="flex items-center gap-2">
                  Skills Sought
                  {isGenerating && !generatedFields.skills && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  )}
                  {generatedFields.skills && !isGenerating && (
                    <span className="flex items-center text-green-500 text-sm font-medium">
                      <Check className="h-4 w-4 mr-1" />
                      Success!
                    </span>
                  )}
                  {!isGenerating && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      className="ml-auto flex items-center gap-1 text-xs"
                      onClick={generateSkills}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate
                    </Button>
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
                <FormLabel className="flex items-center gap-2">
                  Minimum Skills
                  {isGenerating && !generatedFields.minSkills && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  )}
                  {generatedFields.minSkills && !isGenerating && (
                    <span className="flex items-center text-green-500 text-sm font-medium">
                      <Check className="h-4 w-4 mr-1" />
                      Success!
                    </span>
                  )}
                  {!isGenerating && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      className="ml-auto flex items-center gap-1 text-xs"
                      onClick={generateMinSkills}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate
                    </Button>
                  )}
                </FormLabel>
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
    </div>
  );
}
