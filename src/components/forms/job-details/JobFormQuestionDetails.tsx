
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFieldsGenerator } from "@/hooks/job-form/useFieldsGenerator";

export function JobFormQuestionDetails() {
  const form = useFormContext();
  const { 
    generateVideoQuestions, 
    generateScreeningQuestions,
    generationState 
  } = useFieldsGenerator(form);
  
  const { isGenerating, generatedFields } = generationState;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Interview Questions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="videoQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Video Questions
                {isGenerating && !generatedFields.videoQuestions && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
                {generatedFields.videoQuestions && !isGenerating && (
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
                    onClick={generateVideoQuestions}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generate
                  </Button>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter video questions for candidates"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="screeningQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Screening Questions
                {isGenerating && !generatedFields.screeningQuestions && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
                {generatedFields.screeningQuestions && !isGenerating && (
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
                    onClick={generateScreeningQuestions}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generate
                  </Button>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter screening questions for candidates"
                  className="min-h-[150px]"
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
