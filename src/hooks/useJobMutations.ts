import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { 
  calculateRates, 
  generateInternalTitle, 
  getWorkDetails, 
  getPayDetails, 
  generateM1, 
  generateM2, 
  generateM3 
} from "@/utils/jobUtils";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useJobMutations(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const addJob = async (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
    const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
    const { high, medium, low } = calculateRates(jobData.rate);
    
    // Get data from database instead of using defaults
    const workDetails = await getWorkDetails(jobData.locale);
    const payDetails = await getPayDetails(jobData.locale);
    
    // Generate placeholder messages
    const m1 = generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
    const m2 = generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
    const m3 = generateM3(jobData.videoQuestions);

    // Get the IDs for the relations
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('name', jobData.client)
      .single();
      
    const { data: localeData } = await supabase
      .from('locales')
      .select('id')
      .eq('name', jobData.locale)
      .single();
      
    const { data: flavorData } = await supabase
      .from('flavors')
      .select('id')
      .eq('name', jobData.flavor)
      .single();
      
    const { data: statusData } = await supabase
      .from('job_statuses')
      .select('id')
      .eq('name', jobData.status)
      .single();
      
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', jobData.owner)
      .single();

    // Insert into Supabase
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        internal_title: internalTitle,
        candidate_facing_title: jobData.candidateFacingTitle,
        jd: jobData.jd,
        status: jobData.status,
        skills_sought: jobData.skillsSought,
        min_skills: jobData.minSkills,
        lir: jobData.lir,
        client: jobData.client,
        client_id: clientData?.id,
        comp_desc: jobData.compDesc,
        rate: jobData.rate,
        high_rate: high,
        medium_rate: medium,
        low_rate: low,
        locale: jobData.locale,
        locale_id: localeData?.id,
        owner: jobData.owner,
        owner_id: ownerData?.id,
        date: jobData.date,
        work_details: workDetails,
        pay_details: payDetails,
        other: jobData.other,
        video_questions: jobData.videoQuestions,
        screening_questions: jobData.screeningQuestions,
        flavor: jobData.flavor,
        flavor_id: flavorData?.id,
        status_id: statusData?.id,
        m1: m1,
        m2: m2,
        m3: m3,
        linkedin_search: '' // Add empty linkedin_search to satisfy database schema
      })
      .select();

    if (error) {
      console.error("Error adding job:", error);
      toast({
        title: "Error Adding Job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      // Transform the returned data to match our Job interface
      const newJob: Job = {
        id: data[0].id,
        internalTitle,
        candidateFacingTitle: jobData.candidateFacingTitle,
        jd: jobData.jd,
        status: jobData.status,
        skillsSought: jobData.skillsSought,
        minSkills: jobData.minSkills,
        lir: jobData.lir,
        client: jobData.client,
        clientId: data[0].client_id,
        compDesc: jobData.compDesc,
        rate: jobData.rate,
        highRate: high,
        mediumRate: medium,
        lowRate: low,
        locale: jobData.locale,
        localeId: data[0].locale_id,
        owner: jobData.owner,
        ownerId: data[0].owner_id,
        date: jobData.date,
        workDetails: workDetails,
        payDetails: payDetails,
        other: jobData.other || "",
        videoQuestions: jobData.videoQuestions,
        screeningQuestions: jobData.screeningQuestions,
        flavor: jobData.flavor,
        flavorId: data[0].flavor_id,
        statusId: data[0].status_id,
        m1,
        m2,
        m3
      };

      // Update local state
      setJobs([...jobs, newJob]);
      
      toast({
        title: "Job Added",
        description: `${internalTitle} has been added successfully.`,
      });
    }
  };

  const updateJob = async (updatedJob: Job) => {
    // Update in Supabase
    const { error } = await supabase
      .from('jobs')
      .update({
        internal_title: updatedJob.internalTitle,
        candidate_facing_title: updatedJob.candidateFacingTitle,
        jd: updatedJob.jd,
        status: updatedJob.status,
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
        locale: updatedJob.locale,
        locale_id: updatedJob.localeId,
        owner: updatedJob.owner,
        owner_id: updatedJob.ownerId,
        date: updatedJob.date,
        work_details: updatedJob.workDetails,
        pay_details: updatedJob.payDetails,
        other: updatedJob.other,
        video_questions: updatedJob.videoQuestions,
        screening_questions: updatedJob.screeningQuestions,
        flavor: updatedJob.flavor,
        flavor_id: updatedJob.flavorId,
        status_id: updatedJob.statusId,
        linkedin_search: '' // Add empty linkedin_search to satisfy database schema
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
  };

  const deleteJob = async (id: string) => {
    const jobToDelete = jobs.find(job => job.id === id);
    
    // Delete from Supabase
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error Deleting Job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setJobs(jobs.filter((job) => job.id !== id));
    
    toast({
      title: "Job Deleted",
      description: jobToDelete 
        ? `${jobToDelete.internalTitle} has been deleted.`
        : "Job has been deleted.",
      variant: "destructive",
    });
  };

  const getJob = (id: string) => {
    return jobs.find((job) => job.id === id);
  };

  return { addJob, updateJob, deleteJob, getJob };
}
