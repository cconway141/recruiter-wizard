
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export function JobFormQuestionDetails() {
  const form = useFormContext();
  const [isGeneratingScreeningQuestions, setIsGeneratingScreeningQuestions] = useState(false);
  const [isGeneratingVideoQuestions, setIsGeneratingVideoQuestions] = useState(false);
  const videoQuestionsValue = form.watch("videoQuestions");
  const minSkillsValue = form.watch("minSkills");
  const [videoQuestionsGenerated, setVideoQuestionsGenerated] = useState(false);
  const [screeningQuestionsGenerated, setScreeningQuestionsGenerated] = useState(false);
  
  // Track if screening questions have already been generated
  const screeningQuestionsGeneratedRef = useRef(false);
  const videoQuestionsGeneratedRef = useRef(false);

  // Generate screening questions when video questions are populated
  useEffect(() => {
    const generateScreeningQuestions = async () => {
      // Check if video questions exist, minimum skills exist, not currently generating, and haven't already generated
      if (
        videoQuestionsValue && 
        minSkillsValue && 
        !isGeneratingScreeningQuestions && 
        !screeningQuestionsGeneratedRef.current
      ) {
        setIsGeneratingScreeningQuestions(true);
        try {
          const { data, error } = await supabase.functions.invoke('generate-screening-questions', {
            body: { minSkills: minSkillsValue }
          });

          if (error) throw error;

          if (data?.screeningQuestions) {
            form.setValue('screeningQuestions', data.screeningQuestions, { 
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true 
            });
            setScreeningQuestionsGenerated(true);
            // Mark as generated to prevent multiple calls
            screeningQuestionsGeneratedRef.current = true;
            
            toast({
              title: "Screening questions generated",
              description: "Screening questions have been automatically generated based on the skills.",
            });
          }
        } catch (error) {
          console.error("Error generating screening questions:", error);
          toast({
            title: "Error generating screening questions",
            description: "Could not generate screening questions from the skills.",
            variant: "destructive",
          });
        } finally {
          setIsGeneratingScreeningQuestions(false);
        }
      }
    };

    generateScreeningQuestions();
  }, [videoQuestionsValue, minSkillsValue, form, isGeneratingScreeningQuestions]);

  // Function to regenerate video questions
  const handleRegenerateVideoQuestions = async () => {
    const minSkills = form.getValues('minSkills');
    
    if (!minSkills) {
      toast({
        title: "Missing minimum skills",
        description: "Minimum skills are required to generate video questions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingVideoQuestions(true);
    setVideoQuestionsGenerated(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-questions', {
        body: { minSkills },
      });

      if (error) throw error;

      if (data?.videoQuestions) {
        form.setValue('videoQuestions', data.videoQuestions, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        setVideoQuestionsGenerated(true);
        videoQuestionsGeneratedRef.current = true;
        
        toast({
          title: "Video questions regenerated",
          description: "Video questions have been regenerated based on the minimum skills.",
        });
      }
    } catch (error) {
      console.error("Error regenerating video questions:", error);
      toast({
        title: "Error regenerating video questions",
        description: "Could not regenerate video questions from the minimum skills.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVideoQuestions(false);
    }
  };

  // Function to regenerate screening questions
  const handleRegenerateScreeningQuestions = async () => {
    const minSkills = form.getValues('minSkills');
    
    if (!minSkills) {
      toast({
        title: "Missing minimum skills",
        description: "Minimum skills are required to generate screening questions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingScreeningQuestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-screening-questions', {
        body: { minSkills }
      });

      if (error) throw error;

      if (data?.screeningQuestions) {
        form.setValue('screeningQuestions', data.screeningQuestions, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        setScreeningQuestionsGenerated(true);
        
        toast({
          title: "Screening questions regenerated",
          description: "Screening questions have been regenerated based on the skills.",
        });
      }
    } catch (error) {
      console.error("Error regenerating screening questions:", error);
      toast({
        title: "Error regenerating screening questions",
        description: "Could not regenerate screening questions from the skills.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScreeningQuestions(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="videoQuestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Video Questions
              {isGeneratingVideoQuestions && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              )}
              {videoQuestionsGenerated && !isGeneratingVideoQuestions && (
                <span className="flex items-center text-green-500 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  Success!
                </span>
              )}
              {!isGeneratingVideoQuestions && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  className="ml-auto flex items-center gap-1 text-xs"
                  onClick={handleRegenerateVideoQuestions}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Questions for the candidate's video response"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              These questions will be included in the video instructions message (M3).
            </FormDescription>
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
              {isGeneratingScreeningQuestions && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              )}
              {screeningQuestionsGenerated && !isGeneratingScreeningQuestions && (
                <span className="flex items-center text-green-500 text-sm font-medium">
                  <Check className="h-4 w-4 mr-1" />
                  Success!
                </span>
              )}
              {!isGeneratingScreeningQuestions && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  className="ml-auto flex items-center gap-1 text-xs"
                  onClick={handleRegenerateScreeningQuestions}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Questions for initial screening"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              These questions will be used during the initial candidate screening.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
