
import React from "react";
import { useFormContext } from "react-hook-form";
import { MessageCard } from "@/components/messages/MessageCard";

interface MessagePreviewSectionProps {
  messages: {
    m1: string | number | null | undefined;
    m2: string | number | null | undefined;
    m3: string | number | null | undefined;
  };
}

export function MessagePreviewSection({ messages }: MessagePreviewSectionProps) {
  const form = useFormContext();
  const previewName = form.watch("previewName") || "Candidate";
  
  return (
    <div className="space-y-4">
      {messages.m1 !== undefined && messages.m1 !== null && (
        <MessageCard
          title="M1 - Initial Outreach"
          message={messages.m1}
          previewName={previewName}
        />
      )}
      
      {messages.m2 !== undefined && messages.m2 !== null && (
        <MessageCard
          title="M2 - Detailed Information"
          message={messages.m2}
          previewName={previewName}
        />
      )}
      
      {messages.m3 !== undefined && messages.m3 !== null && (
        <MessageCard
          title="M3 - Video & Final Questions"
          message={messages.m3}
          previewName={previewName}
        />
      )}
    </div>
  );
}
