
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="previewName"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel>Preview Name (for messages)</FormLabel>
            <FormControl>
              <Input placeholder="Candidate name for preview" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <h4 className="font-medium text-gray-700 mb-2">Message Previews</h4>
      
      {messages.m1 && (
        <MessageCard
          title="M1 - Initial Outreach"
          message={messages.m1}
          previewName={form.watch("previewName")}
        />
      )}
      
      {messages.m2 && (
        <MessageCard
          title="M2 - Detailed Information"
          message={messages.m2}
          previewName={form.watch("previewName")}
        />
      )}
      
      {messages.m3 && (
        <MessageCard
          title="M3 - Video & Final Questions"
          message={messages.m3}
          previewName={form.watch("previewName")}
        />
      )}
    </div>
  );
}
