
import React from "react";
import { useFormContext } from "react-hook-form";
import { MessageCard } from "@/components/messages/MessageCard";

interface MessagePreviewSectionProps {
  messages: {
    m1: string;
    m2: string;
    m3: string;
  };
}

export function MessagePreviewSection({ messages }: MessagePreviewSectionProps) {
  const form = useFormContext();
  const previewName = form.watch("previewName") || "Candidate";
  
  return (
    <div className="space-y-4">
      {messages.m1 && (
        <MessageCard
          title="M1 - Initial Outreach"
          message={messages.m1}
          previewName={previewName}
        />
      )}
      
      {messages.m2 && (
        <MessageCard
          title="M2 - Detailed Information"
          message={messages.m2}
          previewName={previewName}
        />
      )}
      
      {messages.m3 && (
        <MessageCard
          title="M3 - Video & Final Questions"
          message={messages.m3}
          previewName={previewName}
        />
      )}
    </div>
  );
}
