
import { Eye, Pencil, Trash2, Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { generateM1, generateM2, generateM3, generateInternalTitle } from "@/utils/jobUtils";

const StatusBadgeColor = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Aquarium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Inactive: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Closed: "bg-gray-100 text-gray-800 hover:bg-gray-100"
};

// Define a type for copied message tracking
type CopiedMessageInfo = {
  jobId: string;
  messageType: string;
} | null;

export function JobsTable() {
  const { filteredJobs, deleteJob, updateJob, loadFromSupabase } = useJobs();
  const { toast } = useToast();
  // Track both job ID and message type that was copied
  const [copiedMessage, setCopiedMessage] = useState<CopiedMessageInfo>(null);
  const [isUpdatingTitles, setIsUpdatingTitles] = useState(false);

  const copyToClipboard = async (jobId: string, messageType: string, job: any) => {
    try {
      let text = '';
      
      // Generate fresh messages using the latest templates from the database
      if (messageType === "M1") {
        text = await generateM1("[First Name]", job.candidateFacingTitle, job.compDesc, job.owner);
      } else if (messageType === "M2") {
        text = await generateM2(job.candidateFacingTitle, job.payDetails, job.workDetails, job.skillsSought);
      } else if (messageType === "M3") {
        text = await generateM3(job.videoQuestions);
      }
      
      await navigator.clipboard.writeText(text);
      setCopiedMessage({ jobId, messageType });
      
      toast({
        title: "Copied!",
        description: `${messageType} has been copied to clipboard.`,
      });
      
      setTimeout(() => {
        setCopiedMessage(null);
      }, 2000);
    } catch (err) {
      console.error("Error copying message:", err);
      toast({
        title: "Error",
        description: "Failed to copy message to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Helper to check if a specific job's message has been copied
  const isMessageCopied = (jobId: string, messageType: string) => {
    return copiedMessage?.jobId === jobId && copiedMessage?.messageType === messageType;
  };

  // Function to update all job titles to the new format
  const updateAllJobTitles = async () => {
    try {
      setIsUpdatingTitles(true);
      
      // Process jobs in batches to avoid overwhelming the database
      const batchSize = 10;
      let processed = 0;
      
      while (processed < filteredJobs.length) {
        const batch = filteredJobs.slice(processed, processed + batchSize);
        
        // Process each job in the batch
        await Promise.all(batch.map(async (job) => {
          try {
            // Generate new internal title using the new format
            const newInternalTitle = await generateInternalTitle(
              job.client,
              job.candidateFacingTitle,
              job.flavor,
              job.locale
            );
            
            // Only update if the title has changed
            if (newInternalTitle !== job.internalTitle) {
              const updatedJob = { ...job, internalTitle: newInternalTitle };
              await updateJob(updatedJob);
            }
          } catch (error) {
            console.error(`Error updating job ${job.id}:`, error);
          }
        }));
        
        processed += batchSize;
      }
      
      // Refresh data from database to reflect all updates
      await loadFromSupabase();
      
      toast({
        title: "Job Titles Updated",
        description: "All job titles have been updated to the new format.",
      });
    } catch (error) {
      console.error("Error updating job titles:", error);
      toast({
        title: "Error",
        description: "Failed to update job titles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingTitles(false);
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <div className="p-4 flex justify-end">
        <Button 
          onClick={updateAllJobTitles} 
          disabled={isUpdatingTitles}
          className="flex items-center gap-2"
        >
          {isUpdatingTitles ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Update All Job Titles
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rate (US)</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-center">Messages</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No jobs found. Try adjusting your filters or add a new job.
              </TableCell>
            </TableRow>
          ) : (
            filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.internalTitle}</TableCell>
                <TableCell>{job.client}</TableCell>
                <TableCell>
                  <Badge className={StatusBadgeColor[job.status] || ""} variant="outline">
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>${job.rate}/hr</TableCell>
                <TableCell>{job.owner}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(job.id, "M1", job)}
                            className={isMessageCopied(job.id, "M1") ? "bg-green-100" : ""}
                          >
                            {isMessageCopied(job.id, "M1") ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            M1
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy initial outreach message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(job.id, "M2", job)}
                            className={isMessageCopied(job.id, "M2") ? "bg-green-100" : ""}
                          >
                            {isMessageCopied(job.id, "M2") ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            M2
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy role details message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(job.id, "M3", job)}
                            className={isMessageCopied(job.id, "M3") ? "bg-green-100" : ""}
                          >
                            {isMessageCopied(job.id, "M3") ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            M3
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy video request message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this job? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => deleteJob(job.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
