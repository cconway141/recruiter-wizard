
import { Job } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { generateInternalTitle } from "@/utils/titleUtils";

export function useUpdateJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const updateJob = async (updatedJob: Job) => {
    try {
      // Extract locale ID from locale object
      const localeId = updatedJob.locale.id;
      
      // Ensure status is a valid object
      if (!updatedJob.status) {
        updatedJob.status = { id: '', name: 'Active' };
      }
      
      // Extract status name and ID for database
      const statusName = updatedJob.status.name;
      const statusId = updatedJob.status.id || '';
      
      // Regenerate the internal title to ensure it uses the latest format
      const newInternalTitle = await generateInternalTitle(
        updatedJob.client,
        updatedJob.candidateFacingTitle,
        updatedJob.flavor,
        updatedJob.locale
      );

      // Update the job with the new internal title
      updatedJob.internalTitle = newInternalTitle;

      // Get work details and pay details from the locale object
      const workDetails = updatedJob.locale.workDetails || updatedJob.workDetails;
      const payDetails = updatedJob.locale.payDetails || updatedJob.payDetails;

      // Update in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({
          internal_title: updatedJob.internalTitle,
          candidate_facing_title: updatedJob.candidateFacingTitle,
          jd: updatedJob.jd,
          status: statusName,
          status_id: statusId,
          m1: updatedJob.m1,
          m2: updatedJob.m2,
          m3: updatedJob.m3,
          skills_sought: updatedJob.skillsSought,
          min_skills: updatedJob.minSkills,
          lir: updatedJob.lir,
          client: updatedJob.client,
          client_id: updatedJob.clientId,
          comp_desc: updatedJob.compDesc,
          rate: updatedJob.rate,
          high_rate: updatedJob.highRate,
          medium_rate: updatedJob.mediumRate,
          low_rate: updatedJob.lowRate,
          locale: localeId,
          locale_id: updatedJob.localeId,
          owner: updatedJob.owner,
          owner_id: updatedJob.ownerId,
          date: updatedJob.date,
          work_details: workDetails,
          pay_details: payDetails,
          other: updatedJob.other,
          video_questions: updatedJob.videoQuestions,
          screening_questions: updatedJob.screeningQuestions,
          flavor: typeof updatedJob.flavor === 'object' ? updatedJob.flavor.id : updatedJob.flavor,
          flavor_id: updatedJob.flavorId,
          linkedin_search: updatedJob.linkedinSearch
        })
        .eq('id', updatedJob.id);

      if (error) {
        console.error("Error updating job:", error);
        toast({
          title: "Error Updating Job",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
      
      toast({
        title: "Job Updated",
        description: `${updatedJob.internalTitle} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error in useUpdateJob:", error);
      toast({
        title: "Error Updating Job",
        description: `${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  return updateJob;
}
