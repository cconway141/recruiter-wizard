
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { JobFormValues } from "@/components/forms/JobFormDetails";

export type GenerationField = "skills" | "minSkills" | "videoQuestions" | "screeningQuestions";

interface GenerationState {
  isGenerating: boolean;
  generatedFields: Record<GenerationField, boolean>;
}

export function useFieldsGenerator(form: UseFormReturn<JobFormValues>) {
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    generatedFields: {
      skills: false,
      minSkills: false,
      videoQuestions: false,
      screeningQuestions: false
    }
  });

  const resetGenerationState = (field?: GenerationField) => {
    if (field) {
      setGenerationState(prev => ({
        ...prev,
        generatedFields: {
          ...prev.generatedFields,
          [field]: false
        }
      }));
    } else {
      setGenerationState({
        isGenerating: false,
        generatedFields: {
          skills: false,
          minSkills: false,
          videoQuestions: false,
          screeningQuestions: false
        }
      });
    }
  };

  const markFieldAsGenerated = (field: GenerationField) => {
    setGenerationState(prev => ({
      ...prev,
      generatedFields: {
        ...prev.generatedFields,
        [field]: true
      }
    }));
  };

  // Extract skills from job description
  const generateSkills = async () => {
    const jobDescription = form.getValues('jd');
    
    if (!jobDescription?.trim()) {
      toast({
        title: "Missing job description",
        description: "Please enter a job description to extract skills.",
        variant: "destructive",
      });
      return false;
    }
    
    setGenerationState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      console.log("Extracting skills from job description...");
      
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: { jobDescription },
      });

      if (error) {
        throw new Error(`Error calling extraction function: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from skills extraction");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.skills) {
        console.log("Skills extracted successfully");
        form.setValue('skillsSought', data.skills, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        markFieldAsGenerated('skills');
        
        toast({
          title: "Skills extracted",
          description: "Skills have been automatically extracted from the job description.",
        });
        return true;
      } else {
        throw new Error("No skills returned in the response");
      }
    } catch (error) {
      console.error("Error extracting skills:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not extract skills from the job description";
      
      toast({
        title: "Error extracting skills",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate minimum skills from skills sought
  const generateMinSkills = async () => {
    const skillsSought = form.getValues('skillsSought');
    const jobDescription = form.getValues('jd');
    
    if (!skillsSought?.trim() || !jobDescription?.trim()) {
      toast({
        title: "Missing information",
        description: "Both job description and skills are required to generate minimum skills.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-minimum-skills', {
        body: { skillsSought, jobDescription },
      });

      if (error) throw error;

      if (data?.minSkills) {
        form.setValue('minSkills', data.minSkills, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        markFieldAsGenerated('minSkills');
        
        toast({
          title: "Minimum skills extracted",
          description: "Minimum skills with experience levels have been generated.",
        });
        return true;
      } else {
        throw new Error("No minimum skills returned in the response");
      }
    } catch (error) {
      console.error("Error extracting minimum skills:", error);
      toast({
        title: "Error extracting minimum skills",
        description: "Could not generate minimum skills requirements.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate video questions from minimum skills
  const generateVideoQuestions = async () => {
    const minSkills = form.getValues('minSkills');
    
    if (!minSkills?.trim()) {
      toast({
        title: "Missing minimum skills",
        description: "Minimum skills are required to generate video questions.",
        variant: "destructive",
      });
      return false;
    }
    
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
        
        markFieldAsGenerated('videoQuestions');
        
        toast({
          title: "Video questions generated",
          description: "Video questions have been automatically generated based on the minimum skills.",
        });
        return true;
      } else {
        throw new Error("No video questions returned in the response");
      }
    } catch (error) {
      console.error("Error generating video questions:", error);
      toast({
        title: "Error generating video questions",
        description: "Could not generate video questions from the minimum skills.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate screening questions from minimum skills
  const generateScreeningQuestions = async () => {
    const minSkills = form.getValues('minSkills');
    
    if (!minSkills?.trim()) {
      toast({
        title: "Missing minimum skills",
        description: "Minimum skills are required to generate screening questions.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-screening-questions', {
        body: { minSkills },
      });

      if (error) throw error;

      if (data?.screeningQuestions) {
        form.setValue('screeningQuestions', data.screeningQuestions, { 
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true 
        });
        
        markFieldAsGenerated('screeningQuestions');
        
        toast({
          title: "Screening questions generated",
          description: "Screening questions have been automatically generated based on the minimum skills.",
        });
        return true;
      } else {
        throw new Error("No screening questions returned in the response");
      }
    } catch (error) {
      console.error("Error generating screening questions:", error);
      toast({
        title: "Error generating screening questions",
        description: "Could not generate screening questions from the minimum skills.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate all fields in sequence
  const generateAllFields = async () => {
    setGenerationState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // Step 1: Generate skills from job description
      const skillsSuccess = await generateSkills();
      if (!skillsSuccess) {
        throw new Error("Failed to generate skills");
      }
      
      // Step 2: Generate minimum skills from generated skills
      const minSkillsSuccess = await generateMinSkills();
      if (!minSkillsSuccess) {
        throw new Error("Failed to generate minimum skills");
      }
      
      // Step 3: Generate video questions from minimum skills
      const videoQuestionsSuccess = await generateVideoQuestions();
      if (!videoQuestionsSuccess) {
        throw new Error("Failed to generate video questions");
      }
      
      // Step 4: Generate screening questions from minimum skills
      const screeningQuestionsSuccess = await generateScreeningQuestions();
      if (!screeningQuestionsSuccess) {
        throw new Error("Failed to generate screening questions");
      }
      
      toast({
        title: "All fields generated successfully",
        description: "Job description has been processed and all fields have been generated.",
      });
      
      return true;
    } catch (error) {
      console.error("Error in generation sequence:", error);
      toast({
        title: "Generation sequence interrupted",
        description: error instanceof Error ? error.message : "An error occurred during the generation process.",
        variant: "destructive",
      });
      return false;
    } finally {
      setGenerationState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return {
    generateSkills,
    generateMinSkills,
    generateVideoQuestions,
    generateScreeningQuestions,
    generateAllFields,
    resetGenerationState,
    generationState
  };
}
