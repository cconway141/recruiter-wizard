
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MessageCard } from "@/components/messages/MessageCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [selectedMessage, setSelectedMessage] = useState<string>("m1");
  
  // Define message options
  const messageOptions = [
    { value: "m1", label: "M1 - Initial Outreach" },
    { value: "m2", label: "M2 - Detailed Information" },
    { value: "m3", label: "M3 - Video & Final Questions" }
  ];
  
  // Get current message based on selection
  const getCurrentMessage = () => {
    switch (selectedMessage) {
      case "m1":
        return { value: messages.m1, title: "M1 - Initial Outreach" };
      case "m2":
        return { value: messages.m2, title: "M2 - Detailed Information" };
      case "m3":
        return { value: messages.m3, title: "M3 - Video & Final Questions" };
      default:
        return { value: messages.m1, title: "M1 - Initial Outreach" };
    }
  };
  
  const currentMessage = getCurrentMessage();
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="message-select" className="mb-2 block">Select Message Template</Label>
        <Select value={selectedMessage} onValueChange={setSelectedMessage}>
          <SelectTrigger id="message-select" className="w-full">
            <SelectValue placeholder="Select a message template" />
          </SelectTrigger>
          <SelectContent>
            {messageOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {currentMessage.value !== undefined && currentMessage.value !== null && (
        <MessageCard
          title={currentMessage.title}
          message={currentMessage.value}
          previewName={previewName}
        />
      )}
    </div>
  );
}
