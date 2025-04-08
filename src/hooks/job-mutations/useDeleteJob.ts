
import { Job } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useDeleteJob(jobs: Job[], setJobs: (jobs: Job[]) => void) {
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

  return deleteJob;
}
