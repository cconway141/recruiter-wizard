
import { Eye, Pencil, Trash2, Copy, Check } from "lucide-react";
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
  const { filteredJobs, deleteJob } = useJobs();
  const { toast } = useToast();
  // Track both job ID and message type that was copied
  const [copiedMessage, setCopiedMessage] = useState<CopiedMessageInfo>(null);

  const copyToClipboard = (jobId: string, text: string, messageType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage({ jobId, messageType });
    
    toast({
      title: "Copied!",
      description: `${messageType} has been copied to clipboard.`,
    });
    
    setTimeout(() => {
      setCopiedMessage(null);
    }, 2000);
  };

  // Helper to check if a specific job's message has been copied
  const isMessageCopied = (jobId: string, messageType: string) => {
    return copiedMessage?.jobId === jobId && copiedMessage?.messageType === messageType;
  };

  return (
    <div className="rounded-md border bg-white">
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
                            onClick={() => copyToClipboard(job.id, job.m1, "M1")}
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
                            onClick={() => copyToClipboard(job.id, job.m2, "M2")}
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
                            onClick={() => copyToClipboard(job.id, job.m3, "M3")}
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
