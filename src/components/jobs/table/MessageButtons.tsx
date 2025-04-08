
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/types/job";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

// Define a type for copied message tracking
type CopiedMessageInfo = {
  jobId: string;
  messageType: string;
} | null;

interface MessageButtonsProps {
  job: Job;
}

export function MessageButtons({ job }: MessageButtonsProps) {
  const { toast } = useToast();
  const [copiedMessage, setCopiedMessage] = useState<CopiedMessageInfo>(null);
  
  const copyToClipboard = async (jobId: string, messageType: string) => {
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
      setCopiedMessage({
        jobId,
        messageType
      });
      
      toast({
        title: "Copied!",
        description: `${messageType} has been copied to clipboard.`
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

  return (
    <div className="flex justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(job.id, "M1")} 
              className={isMessageCopied(job.id, "M1") ? "bg-green-100" : ""}
            >
              {isMessageCopied(job.id, "M1") ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
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
              onClick={() => copyToClipboard(job.id, "M2")} 
              className={isMessageCopied(job.id, "M2") ? "bg-green-100" : ""}
            >
              {isMessageCopied(job.id, "M2") ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
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
              onClick={() => copyToClipboard(job.id, "M3")} 
              className={isMessageCopied(job.id, "M3") ? "bg-green-100" : ""}
            >
              {isMessageCopied(job.id, "M3") ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              M3
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy video request message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
