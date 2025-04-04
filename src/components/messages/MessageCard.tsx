
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MessageCardProps {
  title: string;
  message: string;
  previewName?: string;
}

export function MessageCard({ title, message, previewName = "Candidate" }: MessageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Replace placeholder with preview name
    const formattedMessage = message.replace("[First Name]", previewName);
    
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    
    toast({
      title: "Copied!",
      description: `${title} has been copied to your clipboard.`,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 pb-2">
        <CardTitle className="text-xl font-semibold text-recruiter-primary">{title}</CardTitle>
        <Button 
          onClick={handleCopy} 
          className={copied ? "bg-green-600 hover:bg-green-700" : "bg-recruiter-secondary hover:bg-recruiter-accent"}
          size="sm"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="whitespace-pre-line text-gray-700">{message.replace("[First Name]", previewName)}</div>
      </CardContent>
    </Card>
  );
}
