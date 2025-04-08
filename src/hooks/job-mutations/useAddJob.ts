
import { Job, Locale } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  calculateRates, 
  generateInternalTitle, 
  getWorkDetails, 
  getPayDetails, 
  generateM1, 
  generateM2, 
  generateM3 
} from "@/utils/jobUtils";

export function useAddJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
  const addJob = async (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
    try {
      console.log("Starting addJob with data:", jobData);
      
      const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
      const { high, medium, low } = calculateRates(jobData.rate);
      
      // Get data from database instead of using defaults
      const workDetails = await getWorkDetails(jobData.locale);
      const payDetails = await getPayDetails(jobData.locale);
      
      // Generate placeholder messages
      const m1 = generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
      const m2 = generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
      const m3 = generateM3(jobData.videoQuestions);

      console.log("Generated data:", { internalTitle, rates: { high, medium, low } });

      // Get the IDs for the relations
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('name', jobData.client)
        .single();
      
      if (clientError) {
        console.error("Client lookup error:", clientError);
        throw new Error(`Client lookup failed: ${clientError.message}`);
      }
      
      console.log("Found client:", clientData);
      
      const { data: localeData, error: localeError } = await supabase
        .from('locales')
        .select('id')
        .eq('name', jobData.locale)
        .single();
      
      if (localeError) {
        console.error("Locale lookup error:", localeError);
        throw new Error(`Locale lookup failed: ${localeError.message}`);
      }
      
      console.log("Found locale:", localeData);
      
      const { data: flavorData, error: flavorError } = await supabase
        .from('flavors')
        .select('id')
        .eq('name', jobData.flavor)
        .single();
      
      if (flavorError) {
        console.error("Flavor lookup error:", flavorError);
        throw new Error(`Flavor lookup failed: ${flavorError.message}`);
      }
      
      console.log("Found flavor:", flavorData);
      
      const { data: statusData, error: statusError } = await supabase
        .from('job_statuses')
        .select('id')
        .eq('name', jobData.status)
        .single();
      
      if (statusError) {
        console.error("Status lookup error:", statusError);
        throw new Error(`Status lookup failed: ${statusError.message}`);
      }
      
      console.log("Found status:", statusData);
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('display_name', jobData.owner)
        .single();
      
      if (ownerError) {
        console.error("Owner lookup error:", ownerError, "Looking for name:", jobData.owner);
        
        // Fetch all profiles to debug
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, display_name, email');
        
        console.log("All available profiles:", allProfiles);
        throw new Error(`Owner lookup failed: ${ownerError.message}. Available owners: ${allProfiles?.map(p => p.display_name).join(', ')}`);
      }
      
      console.log("Found owner:", ownerData);

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
        throw new Error(`Database insert failed: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log("Job added successfully:", data[0]);
        
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
        
        return data[0].id;
      } else {
        throw new Error("No data returned after insertion");
      }
    } catch (error) {
      console.error("Error in useAddJob:", error);
      toast({
        title: "Error Adding Job",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  return addJob;
}
