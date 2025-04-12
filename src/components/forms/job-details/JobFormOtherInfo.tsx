
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useFormProcessorContext } from "../job-form/FormProcessorContext";

export function JobFormOtherInfo() {
  const form = useFormContext();
  const { isEditing } = useFormProcessorContext();
  const [isGeneratingOtherInfo, setIsGeneratingOtherInfo] = useState(false);
  const [otherInfoGenerated, setOtherInfoGenerated] = useState(false);
  const otherInfoGeneratedRef = useRef(false);
  const otherInfoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const jdValue = form.watch("jd");
  const screeningQuestionsValue = form.watch("screeningQuestions");
  const otherInfoValue = form.watch("other");

  // Mark as already generated if we have other info when editing
  useEffect(() => {
    if (isEditing && otherInfoValue && otherInfoValue.trim() !== '' && !otherInfoGeneratedRef.current) {
      otherInfoGeneratedRef.current = true;
    }
  }, [isEditing, otherInfoValue]);

  // Function to generate other information from job description
  const generateOtherInfo = async () => {
    if (!jdValue || !jdValue.trim()) {
      toast({
        title: "Missing job description",
        description: "Job description is required to generate other information.",
        variant: "destructive",
      });
      return;
    }

    // Don't proceed if already generating
    if (isGeneratingOtherInfo) return;

    setIsGeneratingOtherInfo(true);
    setOtherInfoGenerated(false);
    
    // Set a timeout for the API call (60 seconds)
    otherInfoTimeoutRef.current = setTimeout(() => {
      setIsGeneratingOtherInfo(false);
      toast({
        title: "Other information generation timed out",
        description: "The request took too long. You can try again or enter information manually.",
        variant: "destructive",
      });
    }, 60000);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-other-info', {
        body: { jobDescription: jdValue }
      });

      // Clear timeout since we got a response
      if (otherInfoTimeoutRef.current) {
        clearTimeout(otherInfoTimeoutRef.current);
        otherInfoTimeoutRef.current = null;
      }

      if (error) throw error;

      if (data?.otherInfo) {
        form.setValue('other', data.otherInfo, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        setOtherInfoGenerated(true);
        otherInfoGeneratedRef.current = true;
        
        toast({
          title: "Other information generated",
          description: "Additional job details have been extracted from the job description.",
        });
      }
    } catch (error) {
      console.error("Error generating other information:", error);
      toast({
        title: "Error generating other information",
        description: "Could not extract additional information from the job description.",
        variant: "destructive",
      });
    } finally {
      // Clear timeout if it's still active
      if (otherInfoTimeoutRef.current) {
        clearTimeout(otherInfoTimeoutRef.current);
        otherInfoTimeoutRef.current = null;
      }
      setIsGeneratingOtherInfo(false);
    }
  };

  // Generate other info when screening questions are populated (first time only, for new jobs)
  useEffect(() => {
    const autoGenerateOtherInfo = async () => {
      if (
        screeningQuestionsValue && 
        screeningQuestionsValue.trim().length > 0 && 
        !otherInfoGeneratedRef.current && 
        !isGeneratingOtherInfo &&
        !isEditing // Only auto-generate for new jobs, not when editing
      ) {
        // Add a small delay to ensure this happens after the screening questions are complete
        setTimeout(() => {
          generateOtherInfo();
        }, 500);
      }
    };

    autoGenerateOtherInfo();
    
    // Clean up timeout on unmount
    return () => {
      if (otherInfoTimeoutRef.current) {
        clearTimeout(otherInfoTimeoutRef.current);
      }
    };
  }, [screeningQuestionsValue, isGeneratingOtherInfo, isEditing]);

  return (
    <FormField
      control={form.control}
      name="other"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Other Information
            {isGeneratingOtherInfo && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
            {otherInfoGenerated && !isGeneratingOtherInfo && (
              <span className="flex items-center text-green-500 text-sm font-medium">
                <Check className="h-4 w-4 mr-1" />
                Success!
              </span>
            )}
            {!isGeneratingOtherInfo && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="ml-auto flex items-center gap-1 text-xs"
                onClick={generateOtherInfo}
              >
                <RefreshCw className="h-3 w-3" />
                {isEditing ? "Generate" : "Regenerate"}
              </Button>
            )}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Any other relevant information about the role"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Additional context about the industry, product, or specific environment that candidates should know.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
