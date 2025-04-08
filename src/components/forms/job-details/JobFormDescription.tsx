
import { useState, useRef } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function JobFormDescription() {
  const form = useFormContext();
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [isGeneratingMinSkills, setIsGeneratingMinSkills] = useState(false);
  const [isGeneratingVideoQuestions, setIsGeneratingVideoQuestions] = useState(false);
  const [skillsExtracted, setSkillsExtracted] = useState(false);
  const [minSkillsExtracted, setMinSkillsExtracted] = useState(false);
  const [videoQuestionsGenerated, setVideoQuestionsGenerated] = useState(false);
  
  // Track if functions have already been called to prevent multiple calls
  const skillsExtractedRef = useRef(false);
  const minSkillsExtractedRef = useRef(false);
  const videoQuestionsGeneratedRef = useRef(false);

  const extractSkillsFromDescription = async (description: string) => {
    if (!description.trim()) return;
    
    setIsGeneratingSkills(true);
    setSkillsExtracted(false);
    
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
        
        setSkillsExtracted(true);
        skillsExtractedRef.current = true;
        
        toast({
          title: "Skills extracted",
          description: "Skills have been automatically extracted from the job description.",
        });

        // After skills are extracted, generate minimum skills
        await extractMinimumSkills(data.skills, description);
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

  const extractMinimumSkills = async (skillsSought: string, jobDescription: string) => {
    if (!skillsSought.trim() || !jobDescription.trim()) return;
    
    setIsGeneratingMinSkills(true);
    setMinSkillsExtracted(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-minimum-skills', {
        body: { skillsSought, jobDescription },
      });

      if (error) throw error;

      // Update the minimum skills field with the generated content
      if (data?.minSkills) {
        form.setValue('minSkills', data.minSkills, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        setMinSkillsExtracted(true);
        minSkillsExtractedRef.current = true;
        
        toast({
          title: "Minimum skills extracted",
          description: "Minimum skills with experience levels have been generated.",
        });

        // After minimum skills are generated, generate video questions
        await generateVideoQuestions(data.minSkills);
      }
    } catch (error) {
      console.error("Error extracting minimum skills:", error);
      toast({
        title: "Error extracting minimum skills",
        description: "Could not generate minimum skills requirements.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMinSkills(false);
    }
  };

  const generateVideoQuestions = async (minSkills: string) => {
    if (!minSkills.trim()) return;
    
    setIsGeneratingVideoQuestions(true);
    setVideoQuestionsGenerated(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-questions', {
        body: { minSkills },
      });

      if (error) throw error;

      // Update the video questions field with the generated content
      if (data?.videoQuestions) {
        form.setValue('videoQuestions', data.videoQuestions, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        setVideoQuestionsGenerated(true);
        videoQuestionsGeneratedRef.current = true;
        
        toast({
          title: "Video questions generated",
          description: "Video questions have been automatically generated based on the minimum skills.",
        });
      }
    } catch (error) {
      console.error("Error generating video questions:", error);
      toast({
        title: "Error generating video questions",
        description: "Could not generate video questions from the minimum skills.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVideoQuestions(false);
    }
  };

  // Function to regenerate skills only (without the cascade)
  const handleRegenerateSkills = async () => {
    const description = form.getValues('jd');
    if (!description) {
      toast({
        title: "Missing job description",
        description: "Job description is required to extract skills.",
        variant: "destructive",
      });
      return;
    }
    
    await extractSkillsFromDescription(description);
  };

  // Function to regenerate minimum skills only
  const handleRegenerateMinSkills = async () => {
    const skillsSought = form.getValues('skillsSought');
    const jobDescription = form.getValues('jd');
    
    if (!skillsSought || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Both job description and skills are required to generate minimum skills.",
        variant: "destructive",
      });
      return;
    }
    
    await extractMinimumSkills(skillsSought, jobDescription);
  };

  // Function to regenerate video questions only
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
    
    await generateVideoQuestions(minSkills);
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
                  if (!skillsExtractedRef.current) {
                    extractSkillsFromDescription(e.target.value);
                  }
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
                {skillsExtracted && !isGeneratingSkills && (
                  <span className="flex items-center text-green-500 text-sm font-medium">
                    <Check className="h-4 w-4 mr-1" />
                    Success!
                  </span>
                )}
                {!isGeneratingSkills && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    className="ml-auto flex items-center gap-1 text-xs"
                    onClick={handleRegenerateSkills}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
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
                {isGeneratingMinSkills && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
                {minSkillsExtracted && !isGeneratingMinSkills && (
                  <span className="flex items-center text-green-500 text-sm font-medium">
                    <Check className="h-4 w-4 mr-1" />
                    Success!
                  </span>
                )}
                {!isGeneratingMinSkills && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    className="ml-auto flex items-center gap-1 text-xs"
                    onClick={handleRegenerateMinSkills}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
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
  );
}
